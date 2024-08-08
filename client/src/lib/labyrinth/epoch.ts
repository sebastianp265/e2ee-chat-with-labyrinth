import {LabyrinthKeyBundle, LabyrinthPublicKeyBundle} from "@/lib/labyrinth/labyrinth.ts";
import {random} from "@/lib/labyrinth/crypto/utils.ts";
import {kdf_one_key, kdf_two_keys} from "@/lib/labyrinth/crypto/key_derivation.ts";
import {decrypt, encrypt} from "@/lib/labyrinth/crypto/authenticated_symmetric_encryption.ts";
import {pk_verify} from "@/lib/labyrinth/crypto/signing.ts";
import {pk_decrypt, pk_encrypt} from "@/lib/labyrinth/crypto/public_key_encryption.ts";

export type Epoch = {
    id: string,
    sequenceID: bigint,
    rootKey: Buffer,
}

export type ForeignDevice = {
    id: string,
    keyBundle: LabyrinthPublicKeyBundle
}

export type SelfDevice = {
    id: string,
    keyBundle: LabyrinthKeyBundle
}

export type EpochWithoutAssignedID = {
    sequenceID: bigint,
    rootKey: Buffer
}

export function openNewEpoch(prevEpoch: Epoch): {
    newEpochWithoutAssignedID: EpochWithoutAssignedID,
    newEpochEntropy: Buffer,
    newEpochDistributionPreSharedKey: Buffer,
} {
    const newEpochEntropy = random(32)

    const [newEpochChainingKey, newEpochDistributionPreSharedKey] = kdf_two_keys(
        prevEpoch.rootKey,
        Buffer.alloc(0),
        Buffer.from(`epoch_chaining_${prevEpoch.sequenceID.toString()}_${prevEpoch.id}`)
    )
    const newEpochRootKey = kdf_one_key(
        newEpochEntropy,
        newEpochChainingKey,
        Buffer.from("epoch_root_key")
    )

    const newEpochSequenceID = prevEpoch.sequenceID + 1n

    return {
        newEpochWithoutAssignedID: {
            sequenceID: newEpochSequenceID,
            rootKey: newEpochRootKey
        },
        newEpochEntropy,
        newEpochDistributionPreSharedKey
    }
}

export type EncryptedPrevEpochMetadata = {
    sequenceID: Buffer,
    rootKey: Buffer
}

export function encryptPrevEpoch(prevEpochRootKey: Buffer,
                                 newEpochRootKey: Buffer,
                                 prevEpochSequenceID: bigint,
                                 newEpochSequenceID: bigint): EncryptedPrevEpochMetadata {
    const newEpochDataStorageKey = kdf_one_key(
        newEpochRootKey,
        Buffer.alloc(0),
        Buffer.concat([
            Buffer.from("epoch_data_storage_"),
            Buffer.from(
                Buffer.from(newEpochSequenceID.toString())
                    .toString("base64")
            )
        ])
    )

    const encryptedPrevEpochSequenceID = encrypt(
        newEpochDataStorageKey,
        Buffer.from("epoch_data_metadata"),
        Buffer.from(prevEpochSequenceID.toString())
    )

    const encryptedPrevEpochRootKey = encrypt(
        newEpochDataStorageKey,
        Buffer.from("epoch_data_metadata"),
        prevEpochRootKey
    )

    return {
        sequenceID: encryptedPrevEpochSequenceID,
        rootKey: encryptedPrevEpochRootKey
    }
}


export function decryptPrevEpoch(newEpochRootKey: Buffer,
                                 newEpochSequenceID: bigint,
                                 encryptedPrevEpochMetadata: EncryptedPrevEpochMetadata): EpochWithoutAssignedID {
    const newEpochDataStorageKey = kdf_one_key(
        newEpochRootKey,
        Buffer.alloc(0),
        Buffer.concat([
            Buffer.from("epoch_data_storage_"),
            Buffer.from(
                Buffer.from(newEpochSequenceID.toString())
                    .toString("base64")
            )
        ])
    )

    const prevEpochSequenceID = BigInt(decrypt(
        newEpochDataStorageKey,
        Buffer.from("epoch_data_metadata"),
        encryptedPrevEpochMetadata.sequenceID
    ).toString())

    const prevEpochRootKey = decrypt(
        newEpochDataStorageKey,
        Buffer.from("epoch_data_metadata"),
        encryptedPrevEpochMetadata.rootKey
    )

    return {
        sequenceID: prevEpochSequenceID,
        rootKey: prevEpochRootKey
    }
}

// UNUSED DUE TO AMBIGUITY IN PROTOCOL
//
// export function getNewEpochDevices(prevEpochDeviceMacKey: Buffer,
//                                    epochDevices: RecipientDevice[]) {
//     const newEpochDevices: RecipientDevice[] = []
//     const invalidDevices: RecipientDevice[] = []
//     for (const epochDevice of epochDevices) {
//         const expectedPrevEpochDeviceMac = mac(
//             epochDevice.keyBundle.deviceKeyPub.getPublicKeyBytes(),
//             prevEpochDeviceMacKey
//         )
//
//         if (!epochDevice.mac.equals(expectedPrevEpochDeviceMac)) {
//             invalidDevices.push(epochDevice)
//             continue
//         }
//
//         const isValidEpochStorageKey = pk_verify(
//             epochDevice.keyBundle.deviceKeyPub,
//             epochDevice.keyBundle.epochStorageKeySig,
//             Buffer.of(0x30),
//             epochDevice.keyBundle.epochStorageKeyPub.getPublicKeyBytes()
//         )
//         if (!isValidEpochStorageKey) {
//             invalidDevices.push(epochDevice)
//             continue
//         }
//
//         newEpochDevices.push(epochDevice)
//     }
//
//     return {newEpochDevices, invalidDevices}
// }

class InvalidEpochStorageKey extends Error {
    constructor(deviceID: string) {
        super(`Device with id = ${deviceID} doesn't have valid epoch storage key`);

        Object.setPrototypeOf(this, InvalidEpochStorageKey.prototype)
    }
}

export function encryptNewEpochEntropy(selfDevice: SelfDevice,
                                       recipientDevice: ForeignDevice,
                                       newEpochDistributionPreSharedKey: Buffer,
                                       newEpochSequenceID: bigint,
                                       newEpochEntropy: Buffer): Buffer {
    const isValidEpochStorageKey = pk_verify(
        recipientDevice.keyBundle.deviceKeyPub,
        recipientDevice.keyBundle.epochStorageKeySig,
        Buffer.of(0x30),
        recipientDevice.keyBundle.epochStorageKeyPub.getPublicKeyBytes()
    )
    if (!isValidEpochStorageKey) {
        throw new InvalidEpochStorageKey(recipientDevice.id)
    }

    return pk_encrypt(
        recipientDevice.keyBundle.epochStorageKeyPub,
        selfDevice.keyBundle.public.epochStorageAuthKeyPub,
        selfDevice.keyBundle.private.epochStorageAuthKeyPriv,
        newEpochDistributionPreSharedKey,
        Buffer.from(`epoch_${newEpochSequenceID}`),
        newEpochEntropy
    )
}

class InvalidEpochStorageAuthKey extends Error {
    constructor(deviceID: string) {
        super(`Device with id = ${deviceID} doesn't have valid epoch storage auth key`);

        Object.setPrototypeOf(this, InvalidEpochStorageKey.prototype)
    }
}


export function joinNewEpoch(selfDevice: SelfDevice,
                             senderDevice: ForeignDevice,
                             prevEpoch: Epoch,
                             encryptedNewEpochEntropy: Buffer): EpochWithoutAssignedID {
    const [newEpochChainingKey, newEpochDistributionPreSharedKey] = kdf_two_keys(
        prevEpoch.rootKey,
        Buffer.alloc(0),
        Buffer.from(`epoch_chaining_${prevEpoch.sequenceID}_${prevEpoch.id}`)
    )

    const newEpochSequenceID = prevEpoch.sequenceID + 1n

    const isValidEpochStorageAuthKey = pk_verify(
        senderDevice.keyBundle.deviceKeyPub,
        senderDevice.keyBundle.epochStorageAuthKeySig,
        Buffer.of(0x31),
        senderDevice.keyBundle.epochStorageAuthKeyPub.getPublicKeyBytes()
    )
    if (!isValidEpochStorageAuthKey) {
        throw new InvalidEpochStorageAuthKey(senderDevice.id)
    }

    const newEpochEntropy = pk_decrypt(
        selfDevice.keyBundle.public.epochStorageKeyPub,
        selfDevice.keyBundle.private.epochStorageKeyPriv,
        senderDevice.keyBundle.epochStorageAuthKeyPub,
        newEpochDistributionPreSharedKey,
        Buffer.from(`epoch_${newEpochSequenceID}`),
        encryptedNewEpochEntropy
    )

    const newEpochRootKey = kdf_one_key(newEpochEntropy, newEpochChainingKey, Buffer.from("epoch_root_key"))

    return {
        sequenceID: newEpochSequenceID,
        rootKey: newEpochRootKey
    }
}
