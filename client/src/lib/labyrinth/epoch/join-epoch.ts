import {kdf_one_key, kdf_two_keys} from "@/lib/labyrinth/crypto/key-derivation.ts";
import {pk_verify} from "@/lib/labyrinth/crypto/signing.ts";
import {pk_decrypt} from "@/lib/labyrinth/crypto/public-key-encryption.ts";
import {decrypt} from "@/lib/labyrinth/crypto/authenticated-symmetric-encryption.ts";
import {Epoch, EpochStorage} from "@/lib/labyrinth/epoch/EpochStorage.ts";
import {
    DeviceKeyBundleWithoutEpochStorageAuthKeyPair,
    DevicePublicKeyBundle
} from "@/lib/labyrinth/device/device.ts";
import {PublicKey} from "@signalapp/libsignal-client";

// TODO: Extend some unexpected labyrinth error
class InvalidEpochStorageAuthKey extends Error {
    constructor() {
        super("Sender epoch storage auth key is corrupted");

        Object.setPrototypeOf(this, InvalidEpochStorageAuthKey.prototype)
    }
}

export type GetNewerEpochJoinData = {
    epochID: string,
    encryptedEpochEntropy: Buffer,
    senderDevicePublicKeyBundleSerialized: {
        deviceKeyPub: Buffer,

        epochStorageKeyPub: Buffer,
        epochStorageKeySig: Buffer,

        epochStorageAuthKeyPub: Buffer,
        epochStorageAuthKeySig: Buffer,
    }
}

export type GetOlderEpochJoinData = {
    epochID: string,
    encryptedEpochSequenceID: Buffer,
    encryptedEpochRootKey: Buffer,
}

export type AuthenticateDeviceToEpochResponse = {
    deviceID: string
}

export type JoinEpochWebClient = {
    getNewerEpochJoinData: (newerEpochSequenceID: string) => Promise<GetNewerEpochJoinData>
    getOlderEpochJoinData: (olderEpochSequenceID: string) => Promise<GetOlderEpochJoinData>
    getNewestEpochSequenceID: () => Promise<string>
    authenticateDeviceToEpoch: (devicePublicKeyBundle: DevicePublicKeyBundle) => Promise<AuthenticateDeviceToEpochResponse>
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
    const newestEpochSequenceID = await joinEpochWebClient.getNewestEpochSequenceID()

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

    const [newerEpochChainingKey, newerEpochDistributionPreSharedKey] = kdf_two_keys(
        newestKnownEpoch.rootKey,
        Buffer.alloc(0),
        Buffer.from(`epoch_chaining_${newestKnownEpoch.sequenceID}_${newestKnownEpoch.id}`)
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
        Buffer.of(0x31),
        senderDevice.epochStorageAuthKeyPub.getPublicKeyBytes()
    )
    if (!isValidEpochStorageAuthKey) {
        throw new InvalidEpochStorageAuthKey()
    }

    const newerEpochEntropy = pk_decrypt(
        deviceKeyBundle.public.epochStorageKeyPub,
        deviceKeyBundle.private.epochStorageKeyPriv,
        senderDevice.epochStorageAuthKeyPub,
        newerEpochDistributionPreSharedKey,
        Buffer.from(`epoch_${newerEpochSequenceID}`),
        encryptedNewerEpochEntropy
    )

    const newerEpochRootKey = kdf_one_key(
        newerEpochEntropy,
        newerEpochChainingKey,
        Buffer.from("epoch_root_key")
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

    const olderEpochDataStorageKey = kdf_one_key(
        oldestKnownEpoch.rootKey,
        Buffer.alloc(0),
        Buffer.from(`epoch_data_storage_${Buffer.from(oldestKnownEpoch.sequenceID).toString('base64')}`)
    )

    const expectedOlderEpochSequenceID = decrypt(
        olderEpochDataStorageKey,
        Buffer.from("epoch_data_metadata"),
        encryptedOlderEpochSequenceID
    )
    if (olderEpochSequenceID !== expectedOlderEpochSequenceID.toString()) {
        throw new Error("Older epoch metadata has been corrupted")
    }

    const olderEpochRootKey = decrypt(
        olderEpochDataStorageKey,
        Buffer.from("epoch_data_metadata"),
        encryptedOlderEpochRootKey
    )

    return {
        id: olderEpochID,
        sequenceID: olderEpochSequenceID,
        rootKey: olderEpochRootKey,
    }
}