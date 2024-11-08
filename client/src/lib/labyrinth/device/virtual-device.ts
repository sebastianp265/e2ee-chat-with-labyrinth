import {decrypt, encrypt} from "@/lib/labyrinth/crypto/authenticated-symmetric-encryption.ts";
import {pk_sig_keygen, pk_sign} from "@/lib/labyrinth/crypto/signing.ts";
import {bytes_equal, decode, encode, random} from "../crypto/utils.ts";
import {kdf_two_keys} from "@/lib/labyrinth/crypto/key-derivation.ts";
import {EpochWithoutID} from "@/lib/labyrinth/epoch/EpochStorage.ts";
import {
    DeviceKeyBundleWithoutEpochStorageAuthKeyPair,
    DevicePrivateKeyBundleWithoutEpochStorageAuthKeyPair,
    DevicePublicKeyBundleWithoutEpochStorageAuthKeyPair
} from "@/lib/labyrinth/device/device.ts";
import {pk_enc_keygen} from "@/lib/labyrinth/crypto/public-key-encryption.ts";
import {PrivateKey} from "@/lib/labyrinth/crypto/keys.ts";
import {decodeFromBase64, encodeToBase64} from "@/lib/labyrinth/crypto/utils.ts";

export type VirtualDeviceKeyBundle = DeviceKeyBundleWithoutEpochStorageAuthKeyPair

export type VirtualDevicePrivateKeyBundle = DevicePrivateKeyBundleWithoutEpochStorageAuthKeyPair

export type VirtualDevicePublicKeyBundle = DevicePublicKeyBundleWithoutEpochStorageAuthKeyPair

export class VirtualDevice {
    readonly id: string
    readonly keyBundle: VirtualDeviceKeyBundle

    private constructor(id: string, keyBundle: VirtualDeviceKeyBundle) {
        this.id = id
        this.keyBundle = keyBundle
    }

    public static async fromFirstEpoch(userID: string) {
        const recoveryCode = generateRecoveryCode()
        const {
            virtualDeviceID,
            virtualDeviceDecryptionKey
        } = await deriveVirtualDeviceIDAndDecryptionKey(userID, recoveryCode)
        const keyBundle = generateVirtualDeviceKeyBundle()
        const virtualDevice = new VirtualDevice(virtualDeviceID, keyBundle)

        return {
            virtualDevice,
            virtualDeviceDecryptionKey,
            recoveryCode,
        }
    }

    public static async fromRecoveryCode(userID: string,
                                         recoveryCode: string,
                                         webClient: GetVirtualDeviceRecoverySecretsWebClient) {
        const {
            virtualDeviceID,
            virtualDeviceDecryptionKey
        } = await deriveVirtualDeviceIDAndDecryptionKey(userID, recoveryCode)

        const {
            epochID,
            virtualDeviceEncryptedRecoverySecrets
        } = await webClient.getVirtualDeviceRecoverySecrets(virtualDeviceID)

        const {
            virtualDeviceKeyBundle,
            epochWithoutID
        } = await decryptVirtualDeviceRecoverSecrets(
            virtualDeviceDecryptionKey,
            virtualDeviceEncryptedRecoverySecrets
        )

        const epoch = {
            id: epochID,
            ...epochWithoutID
        }

        const virtualDevice = new VirtualDevice(virtualDeviceID, virtualDeviceKeyBundle)

        return {
            virtualDevice,
            epoch
        }
    }

}

function generateVirtualDeviceKeyBundle(): VirtualDeviceKeyBundle {
    const {privateKey: deviceKeyPriv, publicKey: deviceKeyPub} = pk_sig_keygen()
    const {privateKey: epochStorageKeyPriv, publicKey: epochStorageKeyPub} = pk_enc_keygen()
    const epochStorageKeySig = pk_sign(deviceKeyPriv, Uint8Array.of(0x30), epochStorageKeyPub.getPublicKeyBytes())

    const privateKeyBundle: VirtualDevicePrivateKeyBundle = {
        deviceKeyPriv,
        epochStorageKeyPriv
    }

    const publicKeyBundle: VirtualDevicePublicKeyBundle = {
        deviceKeyPub,
        epochStorageKeyPub,
        epochStorageKeySig
    }

    return {
        private: privateKeyBundle,
        public: publicKeyBundle
    }
}

export type GetVirtualDeviceRecoverySecretsResponse = {
    epochID: string,
    virtualDeviceEncryptedRecoverySecrets: VirtualDeviceEncryptedRecoverSecrets
}

export type GetVirtualDeviceRecoverySecretsWebClient = {
    getVirtualDeviceRecoverySecrets: (virtualDeviceID: string) => Promise<GetVirtualDeviceRecoverySecretsResponse>
}

export const VERSION_NUMBER = 1
export const IDENTIFIER = 0

function generateRecoveryCode() {
    // TODO: Error correction code not implemented yet - XXXX
    return `${VERSION_NUMBER}${IDENTIFIER}${random(34).toString()}XXXX`
}

export class InvalidRecoveryCodeFormatError extends Error {

    constructor(message: string) {
        super(message);

        Object.setPrototypeOf(this, InvalidRecoveryCodeFormatError.prototype);
    }
}

async function deriveVirtualDeviceIDAndDecryptionKey(userID: string, recoveryCode: string) {
    if (recoveryCode.length !== 40) throw new InvalidRecoveryCodeFormatError("Recovery code has to be 40 characters long")

    const ikm = encode(recoveryCode.slice(3, 37))
    const info = encode(`BackupRecoveryCode_v${recoveryCode[0]}_${recoveryCode[1]}_${userID}`)

    const [virtualDeviceID, virtualDeviceDecryptionKey] = await kdf_two_keys(
        ikm,
        Uint8Array.of(),
        info,
        16,
        32
    )

    return {
        virtualDeviceID: decode(virtualDeviceID),
        virtualDeviceDecryptionKey,
    }
}

export type VirtualDeviceEncryptedRecoverSecrets = {
    encryptedEpochSequenceID: Uint8Array,
    encryptedEpochRootKey: Uint8Array,
    encryptedDeviceKeyPriv: Uint8Array,
    encryptedEpochStorageKeyPriv: Uint8Array,
    epochStorageKeySig: Uint8Array,
}

export async function encryptVirtualDeviceRecoverSecrets(virtualDeviceDecryptionKey: Uint8Array,
                                                         epochWithoutID: EpochWithoutID,
                                                         virtualDeviceKeyBundle: VirtualDeviceKeyBundle): Promise<VirtualDeviceEncryptedRecoverSecrets> {
    const encryptedEpochSequenceID = await encrypt(
        virtualDeviceDecryptionKey,
        encode("virtual_device:epoch_anon_id"),
        encode(encodeToBase64(epochWithoutID.sequenceID)),
    )

    const encryptedEpochRootKey = await encrypt(
        virtualDeviceDecryptionKey,
        encode("virtual_device:epoch_root_key"),
        epochWithoutID.rootKey,
    )

    const encryptedDeviceKeyPriv = await encrypt(
        virtualDeviceDecryptionKey,
        encode("virtual_device:virtual_device_private_key"),
        virtualDeviceKeyBundle.private.deviceKeyPriv.serialize(),
    )

    const encryptedEpochStorageKeyPriv = await encrypt(
        virtualDeviceDecryptionKey,
        encode("virtual_device:epoch_storage_key_priv"),
        virtualDeviceKeyBundle.private.epochStorageKeyPriv.serialize(),
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

async function decryptVirtualDeviceRecoverSecrets(virtualDeviceDecryptionKey: Uint8Array,
                                                  virtualDeviceRecoverSecretsEncrypted: VirtualDeviceEncryptedRecoverSecrets): Promise<{
    epochWithoutID: EpochWithoutID;
    virtualDeviceKeyBundle: VirtualDeviceKeyBundle;
}> {

    const epochSequenceID = decodeFromBase64(
        decode(
            await decrypt(
                virtualDeviceDecryptionKey,
                encode("virtual_device:epoch_anon_id"),
                virtualDeviceRecoverSecretsEncrypted.encryptedEpochSequenceID,
            )
        )
    )

    const epochRootKey = await decrypt(
        virtualDeviceDecryptionKey,
        encode("virtual_device:epoch_root_key"),
        virtualDeviceRecoverSecretsEncrypted.encryptedEpochRootKey
    )

    const deviceKeyPriv = PrivateKey.deserialize(
        await encrypt(
            virtualDeviceDecryptionKey,
            encode("virtual_device:virtual_device_private_key"),
            virtualDeviceRecoverSecretsEncrypted.encryptedDeviceKeyPriv
        )
    )

    const deviceKeyPub = deviceKeyPriv.getPublicKey()

    const epochStorageKeyPriv = PrivateKey.deserialize(
        await encrypt(
            virtualDeviceDecryptionKey,
            encode("virtual_device:epoch_storage_key_priv"),
            virtualDeviceRecoverSecretsEncrypted.encryptedEpochStorageKeyPriv
        )
    )

    const epochStorageKeyPub = epochStorageKeyPriv.getPublicKey()

    const epochStorageKeySig = pk_sign(
        deviceKeyPriv,
        Uint8Array.of(0x30),
        epochStorageKeyPub.getPublicKeyBytes()
    )

    if (!bytes_equal(virtualDeviceRecoverSecretsEncrypted.epochStorageKeySig, epochStorageKeySig)) {
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
