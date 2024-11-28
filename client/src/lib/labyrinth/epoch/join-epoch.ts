import {kdf_one_key, kdf_two_keys} from "@/lib/labyrinth/crypto/key-derivation.ts";
import {pk_decrypt} from "@/lib/labyrinth/crypto/public-key-encryption.ts";
import {decrypt} from "@/lib/labyrinth/crypto/authenticated-symmetric-encryption.ts";
import {Epoch, EpochStorage} from "@/lib/labyrinth/epoch/EpochStorage.ts";
import {
    DeviceKeyBundle,
    DevicePublicKeyBundle,
    DevicePublicKeyBundleSerialized
} from "@/lib/labyrinth/device/key-bundle/DeviceKeyBundle.ts";
import {VirtualDeviceKeyBundle} from "@/lib/labyrinth/device/key-bundle/VirtualDeviceKeyBundle.ts";
import {BytesSerializer} from "@/lib/labyrinth/BytesSerializer.ts";
import {asciiStringToBytes, bytesToAsciiString} from "@/lib/labyrinth/crypto/utils.ts";

class InvalidEpochStorageAuthKey extends Error {
    constructor() {
        super("Sender epoch storage auth key is corrupted");

        Object.setPrototypeOf(this, InvalidEpochStorageAuthKey.prototype)
    }
}

export type GetNewerEpochJoinDataResponse = {
    epochID: string,
    encryptedEpochEntropy: string,
    senderDevicePublicKeyBundle: DevicePublicKeyBundleSerialized
}

export type GetOlderEpochJoinDataResponse = {
    epochID: string,
    encryptedEpochSequenceID: string,
    encryptedEpochRootKey: string,
}

export type GetNewestEpochSequenceIDResponse = {
    newestEpochSequenceID: string
}

export type JoinEpochWebClient = {
    getNewerEpochJoinData: (newerEpochSequenceID: string) => Promise<GetNewerEpochJoinDataResponse>
    getOlderEpochJoinData: (olderEpochSequenceID: string) => Promise<GetOlderEpochJoinDataResponse>
    getNewestEpochSequenceID: () => Promise<GetNewestEpochSequenceIDResponse>
}

// TODO: Virtual devices require only virtual device info to chain forward, however for backwards chaining,
// it's info is not needed, could fasten initialize process when backward chaining is skipped,
// TODO: Refactor to do lazy loading and fasten application startup
// NOT EXPLICITLY TOLD IN PROTOCOL
// Performs joining to epoch with desiredEpochSequenceID, function mutates passed epochStorage
export async function joinAllEpochs(deviceKeyBundle: DeviceKeyBundle | VirtualDeviceKeyBundle,
                                    epochStorage: EpochStorage,
                                    joinEpochWebClient: JoinEpochWebClient): Promise<void> {
    const chainForwardPromise = chainForward(deviceKeyBundle, epochStorage, joinEpochWebClient)
    const chainBackwardsPromise = chainBackwards(epochStorage, joinEpochWebClient)

    await chainForwardPromise
    await chainBackwardsPromise
}

async function chainForward(deviceKeyBundle: DeviceKeyBundle | VirtualDeviceKeyBundle,
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

async function joinNewerEpoch(deviceKeyBundle: DeviceKeyBundle | VirtualDeviceKeyBundle,
                              newestKnownEpoch: Epoch,
                              joinEpochWebClient: JoinEpochWebClient): Promise<Epoch> {
    const newerEpochSequenceID = (BigInt(newestKnownEpoch.sequenceID) + 1n).toString()

    const [newerEpochChainingKey, newerEpochDistributionPreSharedKey] = await kdf_two_keys(
        newestKnownEpoch.rootKey,
        null,
        asciiStringToBytes(`epoch_chaining_${newestKnownEpoch.sequenceID}_${newestKnownEpoch.id}`)
    )

    const {
        epochID: newerEpochID,
        encryptedEpochEntropy: encryptedNewerEpochEntropy,
        senderDevicePublicKeyBundle
    } = await joinEpochWebClient.getNewerEpochJoinData(newerEpochSequenceID)

    const senderDevice = DevicePublicKeyBundle.deserialize(senderDevicePublicKeyBundle)

    const isValidEpochStorageAuthKey = senderDevice.deviceKeyPub.verify(
        senderDevice.epochStorageAuthKeySig,
        Uint8Array.of(0x31),
        senderDevice.epochStorageAuthKeyPub.getX25519PublicKeyBytes()
    )
    if (!isValidEpochStorageAuthKey) {
        throw new InvalidEpochStorageAuthKey()
    }

    const newerEpochEntropy = await pk_decrypt(
        deviceKeyBundle.pub.epochStorageKeyPub,
        deviceKeyBundle.priv.epochStorageKeyPriv,
        senderDevice.epochStorageAuthKeyPub,
        newerEpochDistributionPreSharedKey,
        asciiStringToBytes(`epoch_${newerEpochSequenceID}`),
        BytesSerializer.deserialize(encryptedNewerEpochEntropy)
    )

    const newerEpochRootKey = await kdf_one_key(
        newerEpochEntropy,
        newerEpochChainingKey,
        asciiStringToBytes("epoch_root_key")
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
        null,
        asciiStringToBytes(`epoch_data_storage_${oldestKnownEpoch.sequenceID}`)
    )

    const expectedOlderEpochSequenceID = bytesToAsciiString(
        await decrypt(
            olderEpochDataStorageKey,
            asciiStringToBytes("epoch_data_metadata"),
            BytesSerializer.deserialize(encryptedOlderEpochSequenceID)
        )
    )
    if (olderEpochSequenceID !== expectedOlderEpochSequenceID) {
        throw new Error("Older epoch metadata has been corrupted")
    }

    const olderEpochRootKey = await decrypt(
        olderEpochDataStorageKey,
        asciiStringToBytes("epoch_data_metadata"),
        BytesSerializer.deserialize(encryptedOlderEpochRootKey)
    )

    return {
        id: olderEpochID,
        sequenceID: olderEpochSequenceID,
        rootKey: olderEpochRootKey,
    }
}