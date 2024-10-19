import {decrypt, encrypt} from "@/lib/labyrinth/crypto/authenticated-symmetric-encryption.ts";
import {PrivateKey} from "@signalapp/libsignal-client";
import {pk_sign} from "@/lib/labyrinth/crypto/signing.ts";
import {random} from "../crypto/utils.ts";
import {kdf_two_keys} from "@/lib/labyrinth/crypto/key-derivation.ts";
import {EpochWithoutID} from "@/lib/labyrinth/epoch/EpochStorage.ts";
import {VirtualDeviceKeyBundle} from "@/lib/labyrinth/device/device.ts";

export type GetVirtualDeviceRecoverySecretsResponse = {
    epochID: string,
    virtualDeviceEncryptedRecoverySecrets: VirtualDeviceEncryptedRecoverSecrets
}

export type GetVirtualDeviceRecoverySecretsWebClient = {
    getVirtualDeviceRecoverySecrets: (virtualDeviceID: string) => GetVirtualDeviceRecoverySecretsResponse
}

export const VERSION_NUMBER = 1
export const IDENTIFIER = 0

export function generateRecoveryCode() {
    // TODO: Error correction code not implemented yet - XXXX
    return `${VERSION_NUMBER}${IDENTIFIER}${random(34).toString()}XXXX`
}

export class InvalidRecoveryCodeFormatError extends Error {

    constructor(message: string) {
        super(message);

        Object.setPrototypeOf(this, InvalidRecoveryCodeFormatError.prototype);
    }
}

export function deriveVirtualDeviceIDAndDecryptionKey(userID: string, recoveryCode: string) {
    if (recoveryCode.length !== 40) throw new InvalidRecoveryCodeFormatError("Recovery code has to be 40 characters long")

    const ikm = Buffer.from(recoveryCode.slice(3, 37))
    const info = Buffer.from(`BackupRecoveryCode_v${recoveryCode[0]}_${recoveryCode[1]}_${userID}`)

    const [virtualDeviceID, virtualDeviceDecryptionKey] = kdf_two_keys(
        ikm,
        Buffer.alloc(0),
        info,
        16,
        32
    )

    return {
        virtualDeviceID: virtualDeviceID.toString(),
        virtualDeviceDecryptionKey
    }
}


export type VirtualDeviceEncryptedRecoverSecrets = {
    encryptedEpochSequenceID: Buffer,
    encryptedEpochRootKey: Buffer,
    encryptedDeviceKeyPriv: Buffer,
    encryptedEpochStorageKeyPriv: Buffer,
    epochStorageKeySig: Buffer,
}

export function encryptVirtualDeviceRecoverSecrets(virtualDeviceDecryptionKey: Buffer,
                                                   epochWithoutID: EpochWithoutID,
                                                   virtualDeviceKeyBundle: VirtualDeviceKeyBundle): VirtualDeviceEncryptedRecoverSecrets {
    const encryptedEpochSequenceID = encrypt(
        virtualDeviceDecryptionKey,
        Buffer.from("virtual_device:epoch_anon_id"),
        Buffer.from(Buffer.from(epochWithoutID.sequenceID).toString('base64'))
    )

    const encryptedEpochRootKey = encrypt(
        virtualDeviceDecryptionKey,
        Buffer.from("virtual_device:epoch_root_key"),
        epochWithoutID.rootKey
    )

    const encryptedDeviceKeyPriv = encrypt(
        virtualDeviceDecryptionKey,
        Buffer.from("virtual_device:virtual_device_private_key"),
        virtualDeviceKeyBundle.private.deviceKeyPriv.serialize()
    )

    const encryptedEpochStorageKeyPriv = encrypt(
        virtualDeviceDecryptionKey,
        Buffer.from("virtual_device:epoch_storage_key_priv"),
        virtualDeviceKeyBundle.private.epochStorageKeyPriv.serialize()
    )

    return {
        encryptedEpochSequenceID,
        encryptedEpochRootKey,
        encryptedDeviceKeyPriv,
        encryptedEpochStorageKeyPriv,
        epochStorageKeySig: virtualDeviceKeyBundle.public.epochStorageKeySig
    }
}

export class InvalidEpochStorageKeySignature extends Error {

    constructor() {
        super("Your message history recovery secrets has been corrupted");

        Object.setPrototypeOf(this, InvalidEpochStorageKeySignature.prototype)
    }
}

export function decryptVirtualDeviceRecoverSecrets(virtualDeviceDecryptionKey: Buffer,
                                                   virtualDeviceRecoverSecretsEncrypted: VirtualDeviceEncryptedRecoverSecrets): {
    epochWithoutID: EpochWithoutID,
    virtualDeviceKeyBundle: VirtualDeviceKeyBundle
} {
    const epochSequenceID = Buffer.from(decrypt(
        virtualDeviceDecryptionKey,
        Buffer.from("virtual_device:epoch_anon_id"),
        virtualDeviceRecoverSecretsEncrypted.encryptedEpochSequenceID,
    ).toString(), "base64").toString()

    const epochRootKey = decrypt(
        virtualDeviceDecryptionKey,
        Buffer.from("virtual_device:epoch_root_key"),
        virtualDeviceRecoverSecretsEncrypted.encryptedEpochRootKey
    )

    const deviceKeyPriv = PrivateKey.deserialize(encrypt(
        virtualDeviceDecryptionKey,
        Buffer.from("virtual_device:virtual_device_private_key"),
        virtualDeviceRecoverSecretsEncrypted.encryptedDeviceKeyPriv
    ))

    const deviceKeyPub = deviceKeyPriv.getPublicKey()

    const epochStorageKeyPriv = PrivateKey.deserialize(encrypt(
        virtualDeviceDecryptionKey,
        Buffer.from("virtual_device:epoch_storage_key_priv"),
        virtualDeviceRecoverSecretsEncrypted.encryptedEpochStorageKeyPriv
    ))

    const epochStorageKeyPub = epochStorageKeyPriv.getPublicKey()

    const epochStorageKeySig = pk_sign(
        deviceKeyPriv,
        Buffer.of(0x30),
        epochStorageKeyPub.getPublicKeyBytes()
    )

    if (!virtualDeviceRecoverSecretsEncrypted.epochStorageKeySig.equals(epochStorageKeySig)) {
        throw new InvalidEpochStorageKeySignature()
    }

    return {
        virtualDeviceKeyBundle: {
            public: {
                deviceKeyPub,
                epochStorageKeyPub,
                epochStorageKeySig
            },
            private: {
                deviceKeyPriv,
                epochStorageKeyPriv
            }
        },
        epochWithoutID: {
            rootKey: epochRootKey,
            sequenceID: epochSequenceID
        }
    }
}
