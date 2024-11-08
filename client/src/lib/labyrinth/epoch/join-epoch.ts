import {kdf_one_key, kdf_two_keys} from "@/lib/labyrinth/crypto/key-derivation.ts";
import {pk_verify} from "@/lib/labyrinth/crypto/signing.ts";
import {pk_decrypt} from "@/lib/labyrinth/crypto/public-key-encryption.ts";
import {decrypt} from "@/lib/labyrinth/crypto/authenticated-symmetric-encryption.ts";
import {Epoch, EpochStorage} from "@/lib/labyrinth/epoch/EpochStorage.ts";
import {DeviceKeyBundleWithoutEpochStorageAuthKeyPair, DevicePublicKeyBundle} from "@/lib/labyrinth/device/device.ts";
import {PublicKey} from "@/lib/labyrinth/crypto/keys.ts";
import {decode, encode, encodeToBase64} from "@/lib/labyrinth/crypto/utils.ts";

// TODO: Extend some unexpected labyrinth error
class InvalidEpochStorageAuthKey extends Error {
    constructor() {
        super("Sender epoch storage auth key is corrupted");

        Object.setPrototypeOf(this, InvalidEpochStorageAuthKey.prototype)
    }
}

export type GetNewerEpochJoinData = {
    epochID: string,
    encryptedEpochEntropy: Uint8Array,
    senderDevicePublicKeyBundleSerialized: {
        deviceKeyPub: Uint8Array,

        epochStorageKeyPub: Uint8Array,
        epochStorageKeySig: Uint8Array,

        epochStorageAuthKeyPub: Uint8Array,
        epochStorageAuthKeySig: Uint8Array,
    }
}

export type GetOlderEpochJoinData = {
    epochID: string,
    encryptedEpochSequenceID: Uint8Array,
    encryptedEpochRootKey: Uint8Array,
}

export type GetNewestEpochSequenceIDResponse = {
    newestEpochSequenceID: string
}

export type JoinEpochWebClient = {
    getNewerEpochJoinData: (newerEpochSequenceID: string) => Promise<GetNewerEpochJoinData>
    getOlderEpochJoinData: (olderEpochSequenceID: string) => Promise<GetOlderEpochJoinData>
    getNewestEpochSequenceID: () => Promise<GetNewestEpochSequenceIDResponse>
}

// TODO: Virtual devices require only virtual device info to chain forward, however for backwards chaining,
// it's info is not needed, could fasten initialize process when backward chaining is skipped,
// TODO: Refactor to do lazy loading and fasten application startup
// NOT EXPLICITLY TOLD IN PROTOCOL
// Performs joining to epoch with desiredEpochSequenceID, function mutates passed epochStorage
export async function joinAllEpochs(deviceKeyBundle: DeviceKeyBundleWithoutEpochStorageAuthKeyPair,
                                    epochStorage: EpochStorage,
                                    joinEpochWebClient: JoinEpochWebClient): Promise<void> {
    const chainForwardPromise = chainForward(deviceKeyBundle, epochStorage, joinEpochWebClient)
    const chainBackwardsPromise = chainBackwards(epochStorage, joinEpochWebClient)

    await chainForwardPromise
    await chainBackwardsPromise
}

async function chainForward(deviceKeyBundle: DeviceKeyBundleWithoutEpochStorageAuthKeyPair,
                            epochStorage: EpochStorage,
                            joinEpochWebClient: JoinEpochWebClient): Promise<void> {
    const {newestEpochSequenceID} = await joinEpochWebClient.getNewestEpochSequenceID()

    let newestKnownEpoch = epochStorage.getNewestEpoch()
    while (newestEpochSequenceID !== newestKnownEpoch.sequenceID) {
        newestKnownEpoch = await joinNewerEpoch(
            deviceKeyBundle,
            newestKnownEpoch,
            joinEpochWebClient
        )
        epochStorage.add(newestKnownEpoch)
    }
}

async function joinNewerEpoch(deviceKeyBundle: DeviceKeyBundleWithoutEpochStorageAuthKeyPair,
                              newestKnownEpoch: Epoch,
                              joinEpochWebClient: JoinEpochWebClient): Promise<Epoch> {
    const newerEpochSequenceID = (BigInt(newestKnownEpoch.sequenceID) + 1n).toString()

    const [newerEpochChainingKey, newerEpochDistributionPreSharedKey] = await kdf_two_keys(
        newestKnownEpoch.rootKey,
        Uint8Array.of(),
        encode(`epoch_chaining_${newestKnownEpoch.sequenceID}_${newestKnownEpoch.id}`)
    )

    const {
        epochID: newerEpochID,
        encryptedEpochEntropy: encryptedNewerEpochEntropy,
        senderDevicePublicKeyBundleSerialized
    } = await joinEpochWebClient.getNewerEpochJoinData(newerEpochSequenceID)

    const senderDevice: DevicePublicKeyBundle = {
        deviceKeyPub: PublicKey.deserialize(senderDevicePublicKeyBundleSerialized.deviceKeyPub),

        epochStorageKeyPub: PublicKey.deserialize(senderDevicePublicKeyBundleSerialized.epochStorageKeyPub),
        epochStorageKeySig: senderDevicePublicKeyBundleSerialized.epochStorageKeySig,

        epochStorageAuthKeyPub: PublicKey.deserialize(senderDevicePublicKeyBundleSerialized.epochStorageAuthKeyPub),
        epochStorageAuthKeySig: senderDevicePublicKeyBundleSerialized.epochStorageAuthKeySig,
    }

    const isValidEpochStorageAuthKey = pk_verify(
        senderDevice.deviceKeyPub,
        senderDevice.epochStorageAuthKeySig,
        Uint8Array.of(0x31),
        senderDevice.epochStorageAuthKeyPub.getPublicKeyBytes()
    )
    if (!isValidEpochStorageAuthKey) {
        throw new InvalidEpochStorageAuthKey()
    }

    const newerEpochEntropy = await pk_decrypt(
        deviceKeyBundle.public.epochStorageKeyPub,
        deviceKeyBundle.private.epochStorageKeyPriv,
        senderDevice.epochStorageAuthKeyPub,
        newerEpochDistributionPreSharedKey,
        encode(`epoch_${newerEpochSequenceID}`),
        encryptedNewerEpochEntropy
    )

    const newerEpochRootKey = await kdf_one_key(
        newerEpochEntropy,
        newerEpochChainingKey,
        encode("epoch_root_key")
    )

    return {
        id: newerEpochID,
        sequenceID: newerEpochSequenceID,
        rootKey: newerEpochRootKey
    }
}

async function chainBackwards(epochStorage: EpochStorage,
                              joinEpochWebClient: JoinEpochWebClient): Promise<void> {
    let oldestKnownEpoch = epochStorage.getOldestEpoch()
    while (oldestKnownEpoch.sequenceID !== "0") {
        oldestKnownEpoch = await joinOlderEpoch(
            oldestKnownEpoch,
            joinEpochWebClient
        )
        epochStorage.add(oldestKnownEpoch)
    }
}

async function joinOlderEpoch(oldestKnownEpoch: Epoch,
                              joinEpochWebClient: JoinEpochWebClient): Promise<Epoch> {
    const olderEpochSequenceID = (BigInt(oldestKnownEpoch.sequenceID) - 1n).toString()

    const {
        epochID: olderEpochID,
        encryptedEpochSequenceID: encryptedOlderEpochSequenceID,
        encryptedEpochRootKey: encryptedOlderEpochRootKey
    } = await joinEpochWebClient.getOlderEpochJoinData(olderEpochSequenceID)

    const olderEpochDataStorageKey = await kdf_one_key(
        oldestKnownEpoch.rootKey,
        Uint8Array.of(),
        encode(`epoch_data_storage_${encodeToBase64(oldestKnownEpoch.sequenceID)}`)
    )

    const expectedOlderEpochSequenceID = decode(
        await decrypt(
            olderEpochDataStorageKey,
            encode("epoch_data_metadata"),
            encryptedOlderEpochSequenceID
        )
    )
    if (olderEpochSequenceID !== expectedOlderEpochSequenceID) {
        throw new Error("Older epoch metadata has been corrupted")
    }

    const olderEpochRootKey = await decrypt(
        olderEpochDataStorageKey,
        encode("epoch_data_metadata"),
        encryptedOlderEpochRootKey
    )

    return {
        id: olderEpochID,
        sequenceID: olderEpochSequenceID,
        rootKey: olderEpochRootKey,
    }
}