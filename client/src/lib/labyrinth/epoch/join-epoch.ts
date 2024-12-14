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
    epochId: string,
    encryptedEpochEntropy: string,
    senderDevicePublicKeyBundle: DevicePublicKeyBundleSerialized
}

export type GetOlderEpochJoinDataResponse = {
    epochId: string,
    encryptedEpochSequenceId: string,
    encryptedEpochRootKey: string,
}

export type GetNewestEpochSequenceIdResponse = {
    newestEpochSequenceId: string
}

export type JoinEpochWebClient = {
    getNewerEpochJoinData: (newerEpochSequenceId: string) => Promise<GetNewerEpochJoinDataResponse>
    getOlderEpochJoinData: (olderEpochSequenceId: string) => Promise<GetOlderEpochJoinDataResponse>
    getNewestEpochSequenceId: () => Promise<GetNewestEpochSequenceIdResponse>
}

// TODO: Virtual devices require only virtual device info to chain forward, however for backwards chaining,
// it's info is not needed, could fasten initialize process when backward chaining is skipped,
// TODO: Refactor to do lazy loading and fasten application startup
// NOT EXPLICITLY TOLD IN PROTOCOL
// Performs joining to epoch with desiredEpochSequenceId, function mutates passed epochStorage
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
    const {newestEpochSequenceId} = await joinEpochWebClient.getNewestEpochSequenceId()

    let newestKnownEpoch = epochStorage.getNewestEpoch()
    while (newestEpochSequenceId !== newestKnownEpoch.sequenceId) {
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
    const newerEpochSequenceId = (BigInt(newestKnownEpoch.sequenceId) + 1n).toString()

    const [newerEpochChainingKey, newerEpochDistributionPreSharedKey] = await kdf_two_keys(
        newestKnownEpoch.rootKey,
        null,
        asciiStringToBytes(`epoch_chaining_${newestKnownEpoch.sequenceId}_${newestKnownEpoch.id}`)
    )

    const {
        epochId: newerEpochId,
        encryptedEpochEntropy: encryptedNewerEpochEntropy,
        senderDevicePublicKeyBundle
    } = await joinEpochWebClient.getNewerEpochJoinData(newerEpochSequenceId)

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
        asciiStringToBytes(`epoch_${newerEpochSequenceId}`),
        BytesSerializer.deserialize(encryptedNewerEpochEntropy)
    )

    const newerEpochRootKey = await kdf_one_key(
        newerEpochEntropy,
        newerEpochChainingKey,
        asciiStringToBytes("epoch_root_key")
    )

    return {
        id: newerEpochId,
        sequenceId: newerEpochSequenceId,
        rootKey: newerEpochRootKey
    }
}

async function chainBackwards(epochStorage: EpochStorage,
                              joinEpochWebClient: JoinEpochWebClient): Promise<void> {
    let oldestKnownEpoch = epochStorage.getOldestEpoch()
    while (oldestKnownEpoch.sequenceId !== "0") {
        oldestKnownEpoch = await joinOlderEpoch(
            oldestKnownEpoch,
            joinEpochWebClient
        )
        epochStorage.add(oldestKnownEpoch)
    }
}

async function joinOlderEpoch(oldestKnownEpoch: Epoch,
                              joinEpochWebClient: JoinEpochWebClient): Promise<Epoch> {
    const olderEpochSequenceId = (BigInt(oldestKnownEpoch.sequenceId) - 1n).toString()

    const {
        epochId: olderEpochId,
        encryptedEpochSequenceId: encryptedOlderEpochSequenceId,
        encryptedEpochRootKey: encryptedOlderEpochRootKey
    } = await joinEpochWebClient.getOlderEpochJoinData(olderEpochSequenceId)

    const olderEpochDataStorageKey = await kdf_one_key(
        oldestKnownEpoch.rootKey,
        null,
        asciiStringToBytes(`epoch_data_storage_${oldestKnownEpoch.sequenceId}`)
    )

    const expectedOlderEpochSequenceId = bytesToAsciiString(
        await decrypt(
            olderEpochDataStorageKey,
            asciiStringToBytes("epoch_data_metadata"),
            BytesSerializer.deserialize(encryptedOlderEpochSequenceId)
        )
    )
    if (olderEpochSequenceId !== expectedOlderEpochSequenceId) {
        throw new Error("Older epoch metadata has been corrupted")
    }

    const olderEpochRootKey = await decrypt(
        olderEpochDataStorageKey,
        asciiStringToBytes("epoch_data_metadata"),
        BytesSerializer.deserialize(encryptedOlderEpochRootKey)
    )

    return {
        id: olderEpochId,
        sequenceId: olderEpochSequenceId,
        rootKey: olderEpochRootKey,
    }
}