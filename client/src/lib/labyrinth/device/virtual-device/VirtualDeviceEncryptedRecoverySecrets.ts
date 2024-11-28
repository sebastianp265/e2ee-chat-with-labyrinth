import {BytesSerializer} from "@/lib/labyrinth/BytesSerializer.ts";
import {EpochWithoutID} from "@/lib/labyrinth/epoch/EpochStorage.ts";
import {
    VirtualDeviceKeyBundle,
    VirtualDevicePrivateKeyBundle,
    VirtualDevicePublicKeyBundle
} from "@/lib/labyrinth/device/key-bundle/VirtualDeviceKeyBundle.ts";
import {decrypt, encrypt} from "@/lib/labyrinth/crypto/authenticated-symmetric-encryption.ts";
import {asciiStringToBytes, bytes_equal, bytesToAsciiString,} from "@/lib/labyrinth/crypto/utils.ts";
import {PrivateKey} from "@/lib/labyrinth/crypto/keys.ts";

export type VirtualDeviceEncryptedRecoverySecretsSerialized = {
    encryptedEpochSequenceID: string,
    encryptedEpochRootKey: string,
    encryptedEpochStorageKeyPriv: string,
    encryptedDeviceKeyPriv: string,
}

export class VirtualDeviceEncryptedRecoverySecrets {
    public readonly encryptedEpochSequenceID: Uint8Array
    public readonly encryptedEpochRootKey: Uint8Array
    public readonly encryptedDeviceKeyPriv: Uint8Array
    public readonly encryptedEpochStorageKeyPriv: Uint8Array

    public constructor(
        encryptedEpochSequenceID: Uint8Array,
        encryptedEpochRootKey: Uint8Array,
        encryptedEpochStorageKeyPriv: Uint8Array,
        encryptedDeviceKeyPriv: Uint8Array,
    ) {
        this.encryptedEpochSequenceID = encryptedEpochSequenceID
        this.encryptedEpochRootKey = encryptedEpochRootKey
        this.encryptedEpochStorageKeyPriv = encryptedEpochStorageKeyPriv
        this.encryptedDeviceKeyPriv = encryptedDeviceKeyPriv
    }

    public static deserialize(virtualDeviceEncryptedRecoverSecretsSerialized: VirtualDeviceEncryptedRecoverySecretsSerialized): VirtualDeviceEncryptedRecoverySecrets {
        const {
            encryptedEpochSequenceID,
            encryptedEpochRootKey,
            encryptedEpochStorageKeyPriv,
            encryptedDeviceKeyPriv,
        } = virtualDeviceEncryptedRecoverSecretsSerialized

        return new VirtualDeviceEncryptedRecoverySecrets(
            BytesSerializer.deserialize(encryptedEpochSequenceID),
            BytesSerializer.deserialize(encryptedEpochRootKey),
            BytesSerializer.deserialize(encryptedEpochStorageKeyPriv),
            BytesSerializer.deserialize(encryptedDeviceKeyPriv),
        )
    }

    public serialize(): VirtualDeviceEncryptedRecoverySecretsSerialized {
        return {
            encryptedEpochSequenceID: BytesSerializer.serialize(this.encryptedEpochSequenceID),
            encryptedEpochRootKey: BytesSerializer.serialize(this.encryptedEpochRootKey),
            encryptedEpochStorageKeyPriv: BytesSerializer.serialize(this.encryptedEpochStorageKeyPriv),
            encryptedDeviceKeyPriv: BytesSerializer.serialize(this.encryptedDeviceKeyPriv),
        }
    }

}

export async function encryptVirtualDeviceRecoverySecrets(
    virtualDeviceDecryptionKey: Uint8Array,
    epochWithoutID: EpochWithoutID,
    virtualDevicePrivateKeyBundle: VirtualDevicePrivateKeyBundle,
): Promise<VirtualDeviceEncryptedRecoverySecrets> {
    const encryptedEpochSequenceID = await encrypt(
        virtualDeviceDecryptionKey,
        asciiStringToBytes("virtual_device:epoch_anon_id"),
        asciiStringToBytes(epochWithoutID.sequenceID),
    )

    const encryptedEpochRootKey = await encrypt(
        virtualDeviceDecryptionKey,
        asciiStringToBytes("virtual_device:epoch_root_key"),
        epochWithoutID.rootKey,
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
        encryptedEpochSequenceID,
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
    epochWithoutID: EpochWithoutID;
    virtualDeviceKeyBundle: VirtualDeviceKeyBundle;
}> {
    const epochSequenceID = bytesToAsciiString(
        await decrypt(
            virtualDeviceDecryptionKey,
            asciiStringToBytes("virtual_device:epoch_anon_id"),
            virtualDeviceEncryptedRecoverySecrets.encryptedEpochSequenceID,
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
        epochWithoutID: {
            rootKey: epochRootKey,
            sequenceID: epochSequenceID
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