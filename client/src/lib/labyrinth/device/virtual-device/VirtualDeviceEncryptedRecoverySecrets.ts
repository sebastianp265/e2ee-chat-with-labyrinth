import {BytesSerializer} from "@/lib/labyrinth/BytesSerializer.ts";
import {EpochWithoutId} from "@/lib/labyrinth/epoch/EpochStorage.ts";
import {
    VirtualDeviceKeyBundle,
    VirtualDevicePrivateKeyBundle,
    VirtualDevicePublicKeyBundle
} from "@/lib/labyrinth/device/key-bundle/VirtualDeviceKeyBundle.ts";
import {decrypt, encrypt} from "@/lib/labyrinth/crypto/authenticated-symmetric-encryption.ts";
import {asciiStringToBytes, bytes_equal, bytesToAsciiString,} from "@/lib/labyrinth/crypto/utils.ts";
import {PrivateKey} from "@/lib/labyrinth/crypto/keys.ts";

export type VirtualDeviceEncryptedRecoverySecretsSerialized = {
    encryptedEpochSequenceId: string,
    encryptedEpochRootKey: string,
    encryptedEpochStorageKeyPriv: string,
    encryptedDeviceKeyPriv: string,
}

export class VirtualDeviceEncryptedRecoverySecrets {
    public readonly encryptedEpochSequenceId: Uint8Array
    public readonly encryptedEpochRootKey: Uint8Array
    public readonly encryptedDeviceKeyPriv: Uint8Array
    public readonly encryptedEpochStorageKeyPriv: Uint8Array

    public constructor(
        encryptedEpochSequenceId: Uint8Array,
        encryptedEpochRootKey: Uint8Array,
        encryptedEpochStorageKeyPriv: Uint8Array,
        encryptedDeviceKeyPriv: Uint8Array,
    ) {
        this.encryptedEpochSequenceId = encryptedEpochSequenceId
        this.encryptedEpochRootKey = encryptedEpochRootKey
        this.encryptedEpochStorageKeyPriv = encryptedEpochStorageKeyPriv
        this.encryptedDeviceKeyPriv = encryptedDeviceKeyPriv
    }

    public static deserialize(virtualDeviceEncryptedRecoverSecretsSerialized: VirtualDeviceEncryptedRecoverySecretsSerialized): VirtualDeviceEncryptedRecoverySecrets {
        const {
            encryptedEpochSequenceId,
            encryptedEpochRootKey,
            encryptedEpochStorageKeyPriv,
            encryptedDeviceKeyPriv,
        } = virtualDeviceEncryptedRecoverSecretsSerialized

        return new VirtualDeviceEncryptedRecoverySecrets(
            BytesSerializer.deserialize(encryptedEpochSequenceId),
            BytesSerializer.deserialize(encryptedEpochRootKey),
            BytesSerializer.deserialize(encryptedEpochStorageKeyPriv),
            BytesSerializer.deserialize(encryptedDeviceKeyPriv),
        )
    }

    public serialize(): VirtualDeviceEncryptedRecoverySecretsSerialized {
        return {
            encryptedEpochSequenceId: BytesSerializer.serialize(this.encryptedEpochSequenceId),
            encryptedEpochRootKey: BytesSerializer.serialize(this.encryptedEpochRootKey),
            encryptedEpochStorageKeyPriv: BytesSerializer.serialize(this.encryptedEpochStorageKeyPriv),
            encryptedDeviceKeyPriv: BytesSerializer.serialize(this.encryptedDeviceKeyPriv),
        }
    }

}

export async function encryptVirtualDeviceRecoverySecrets(
    virtualDeviceDecryptionKey: Uint8Array,
    epochWithoutId: EpochWithoutId,
    virtualDevicePrivateKeyBundle: VirtualDevicePrivateKeyBundle,
): Promise<VirtualDeviceEncryptedRecoverySecrets> {
    const encryptedEpochSequenceId = await encrypt(
        virtualDeviceDecryptionKey,
        asciiStringToBytes("virtual_device:epoch_anon_id"),
        asciiStringToBytes(epochWithoutId.sequenceId),
    )

    const encryptedEpochRootKey = await encrypt(
        virtualDeviceDecryptionKey,
        asciiStringToBytes("virtual_device:epoch_root_key"),
        epochWithoutId.rootKey,
    )

    const encryptedDeviceKeyPriv = await encrypt(
        virtualDeviceDecryptionKey,
        asciiStringToBytes("virtual_device:virtual_device_private_key"),
        asciiStringToBytes(virtualDevicePrivateKeyBundle.deviceKeyPriv.serialize()),
    )

    const encryptedEpochStorageKeyPriv = await encrypt(
        virtualDeviceDecryptionKey,
        asciiStringToBytes("virtual_device:epoch_storage_key_priv"),
        asciiStringToBytes(virtualDevicePrivateKeyBundle.epochStorageKeyPriv.serialize()),
    )

    return new VirtualDeviceEncryptedRecoverySecrets(
        encryptedEpochSequenceId,
        encryptedEpochRootKey,
        encryptedEpochStorageKeyPriv,
        encryptedDeviceKeyPriv,
    )
}

export class CorruptedMessageRecoverySecrets extends Error {

    constructor() {
        super("Your message history recovery secrets has been corrupted");

        Object.setPrototypeOf(this, CorruptedMessageRecoverySecrets.prototype)
    }
}

export async function decryptVirtualDeviceRecoverySecrets(
    virtualDeviceDecryptionKey: Uint8Array,
    virtualDeviceEncryptedRecoverySecrets: VirtualDeviceEncryptedRecoverySecrets,
    expectedVirtualDevicePublicKeyBundle: VirtualDevicePublicKeyBundle
): Promise<{
    epochWithoutId: EpochWithoutId;
    virtualDeviceKeyBundle: VirtualDeviceKeyBundle;
}> {
    const epochSequenceId = bytesToAsciiString(
        await decrypt(
            virtualDeviceDecryptionKey,
            asciiStringToBytes("virtual_device:epoch_anon_id"),
            virtualDeviceEncryptedRecoverySecrets.encryptedEpochSequenceId,
        )
    )

    const epochRootKey = await decrypt(
        virtualDeviceDecryptionKey,
        asciiStringToBytes("virtual_device:epoch_root_key"),
        virtualDeviceEncryptedRecoverySecrets.encryptedEpochRootKey
    )

    const deviceKeyPriv = PrivateKey.deserialize(bytesToAsciiString(
        await decrypt(
            virtualDeviceDecryptionKey,
            asciiStringToBytes("virtual_device:virtual_device_private_key"),
            virtualDeviceEncryptedRecoverySecrets.encryptedDeviceKeyPriv
        )
    ))

    const epochStorageKeyPriv = PrivateKey.deserialize(bytesToAsciiString(
        await decrypt(
            virtualDeviceDecryptionKey,
            asciiStringToBytes("virtual_device:epoch_storage_key_priv"),
            virtualDeviceEncryptedRecoverySecrets.encryptedEpochStorageKeyPriv
        )
    ))

    const virtualDevicePrivateKeyBundle = new VirtualDevicePrivateKeyBundle(
        deviceKeyPriv,
        epochStorageKeyPriv
    )
    const virtualDeviceKeyBundle = new VirtualDeviceKeyBundle(
        virtualDevicePrivateKeyBundle,
        virtualDevicePrivateKeyBundle.getPublicKeyBundle()
    )

    if (!isVirtualDevicePublicKeyBundleValid(expectedVirtualDevicePublicKeyBundle, virtualDeviceKeyBundle.pub)) {
        throw new CorruptedMessageRecoverySecrets()
    }

    return {
        virtualDeviceKeyBundle,
        epochWithoutId: {
            rootKey: epochRootKey,
            sequenceId: epochSequenceId
        }
    }
}

function isVirtualDevicePublicKeyBundleValid(
    expected: VirtualDevicePublicKeyBundle,
    actual: VirtualDevicePublicKeyBundle
): boolean {
    return expected.deviceKeyPub.equals(actual.deviceKeyPub)
        && bytes_equal(expected.epochStorageKeySig, actual.epochStorageKeySig)
        && expected.epochStorageKeyPub.equals(actual.epochStorageKeyPub)
}