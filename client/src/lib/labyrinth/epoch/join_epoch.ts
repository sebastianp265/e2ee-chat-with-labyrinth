import {kdf_one_key, kdf_two_keys} from "@/lib/labyrinth/crypto/key_derivation.ts";
import {pk_verify} from "@/lib/labyrinth/crypto/signing.ts";
import {pk_decrypt} from "@/lib/labyrinth/crypto/public_key_encryption.ts";
import {decrypt} from "@/lib/labyrinth/crypto/authenticated_symmetric_encryption.ts";
import {authenticateToEpoch} from "@/lib/labyrinth/epoch/create_new_epoch.ts";
import {Epoch, ForeignDevice, LabyrinthWebClient, SelfDevice} from "@/lib/labyrinth/labyrinth-types.ts";
import {EpochStorage} from "@/lib/labyrinth/epoch/EpochStorage.ts";

class InvalidEpochStorageAuthKey extends Error {
    constructor(deviceID: string) {
        super(`Device with id = ${deviceID} doesn't have valid epoch storage auth key`);

        Object.setPrototypeOf(this, InvalidEpochStorageAuthKey.prototype)
    }
}

// Performs joining to epoch with desiredEpochSequenceID, function mutates passed epochStorage
export function joinEpoch(selfDevice: SelfDevice,
                          senderDevice: ForeignDevice,
                          epochStorage: EpochStorage,
                          desiredEpochSequenceID: bigint,
                          labyrinthWebClient: LabyrinthWebClient): void {
    let newestKnownEpoch = epochStorage.getNewestEpoch()
    for (let i = BigInt(newestKnownEpoch.sequenceID) + 1n; i <= desiredEpochSequenceID; i++) {
        newestKnownEpoch = joinNewerEpoch(
            selfDevice,
            senderDevice,
            newestKnownEpoch,
            labyrinthWebClient
        )
        epochStorage.addNewerEpoch(newestKnownEpoch)
    }

    if (desiredEpochSequenceID < 0n) {
        throw new RangeError("Epoch sequence id has to be non negative")
    }
    let oldestKnownEpoch = epochStorage.getOldestEpoch()
    for (let i = BigInt(oldestKnownEpoch.sequenceID) - 1n; i >= desiredEpochSequenceID; i--) {
        oldestKnownEpoch = joinOlderEpoch(
            oldestKnownEpoch,
            labyrinthWebClient
        )
        epochStorage.addOlderEpoch(oldestKnownEpoch)
    }
}

function joinNewerEpoch(selfDevice: SelfDevice,
                        senderDevice: ForeignDevice,
                        newestKnownEpoch: Epoch,
                        labyrinthWebClient: LabyrinthWebClient): Epoch {
    const newerEpochSequenceID = (BigInt(newestKnownEpoch.sequenceID) + 1n).toString()
    const [newerEpochChainingKey, newerEpochDistributionPreSharedKey] = kdf_two_keys(
        newestKnownEpoch.rootKey,
        Buffer.alloc(0),
        Buffer.from(`epoch_chaining_${newestKnownEpoch.sequenceID}_${newestKnownEpoch.id}`)
    )

    const {
        epochID: newerEpochID,
        encryptedEpochEntropy: encryptedNewerEpochEntropy
    } = labyrinthWebClient.getEncryptedEpochEntropy(newerEpochSequenceID)

    const isValidEpochStorageAuthKey = pk_verify(
        senderDevice.keyBundle.deviceKeyPub,
        senderDevice.keyBundle.epochStorageAuthKeySig,
        Buffer.of(0x31),
        senderDevice.keyBundle.epochStorageAuthKeyPub.getPublicKeyBytes()
    )
    if (!isValidEpochStorageAuthKey) {
        throw new InvalidEpochStorageAuthKey(senderDevice.id)
    }

    const newerEpochEntropy = pk_decrypt(
        selfDevice.keyBundle.public.epochStorageKeyPub,
        selfDevice.keyBundle.private.epochStorageKeyPriv,
        senderDevice.keyBundle.epochStorageAuthKeyPub,
        newerEpochDistributionPreSharedKey,
        Buffer.from(`epoch_${newerEpochSequenceID}`),
        encryptedNewerEpochEntropy
    )

    const newerEpochRootKey = kdf_one_key(
        newerEpochEntropy,
        newerEpochChainingKey,
        Buffer.from("epoch_root_key")
    )

    authenticateToEpoch(
        newerEpochID,
        newerEpochRootKey,
        newerEpochSequenceID,
        selfDevice.keyBundle.public.deviceKeyPub.serialize(),
        labyrinthWebClient.authenticateToEpoch
    )

    return {
        id: newerEpochID,
        sequenceID: newerEpochSequenceID,
        rootKey: newerEpochRootKey
    }
}

function joinOlderEpoch(oldestKnownEpoch: Epoch,
                        labyrinthWebClient: LabyrinthWebClient): Epoch {
    if (oldestKnownEpoch.sequenceID === "0") {
        throw new RangeError("There cannot be older epoch than one with sequenceID = 0")
    }
    const olderEpochSequenceID = (BigInt(oldestKnownEpoch.sequenceID) - 1n).toString()

    const {
        epochID: olderEpochID,
        encryptedEpochSequenceID: encryptedOlderEpochSequenceID,
        encryptedEpochRootKey: encryptedOlderEpochRootKey
    } = labyrinthWebClient.getEpochRecoveryData(olderEpochSequenceID)

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