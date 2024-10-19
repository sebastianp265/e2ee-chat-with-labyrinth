import {PrivateKey, PublicKey} from "@signalapp/libsignal-client";
import {pk_sig_keygen, pk_sign} from "@/lib/labyrinth/crypto/signing.ts";
import {pk_auth_keygen, pk_enc_keygen} from "@/lib/labyrinth/crypto/public-key-encryption.ts";

// Devices

export type ThisDevice = {
    id: string,
    keyBundle: DeviceKeyBundle
}

export type DeviceKeyBundle = {
    public: DevicePublicKeyBundle
    private: DevicePrivateKeyBundle
}

// "Normal" devices have additional pair of keys used for sending new epoch entropy via public key encryption
export type DevicePublicKeyBundle = DevicePublicKeyBundleWithoutEpochStorageAuthKeyPair & {
    epochStorageAuthKeyPub: PublicKey
    epochStorageAuthKeySig: Buffer
}

// "Normal" devices have additional pair of keys used for sending new epoch entropy via public key encryption
export type DevicePrivateKeyBundle = DevicePrivateKeyBundleWithoutEpochStorageAuthKeyPair & {
    epochStorageAuthKeyPriv: PrivateKey
}

// Virtual device

export type VirtualDevice = {
    id: string,
    keyBundle: VirtualDeviceKeyBundle
}

export type VirtualDeviceKeyBundle = DeviceKeyBundleWithoutEpochStorageAuthKeyPair

export type VirtualDevicePrivateKeyBundle = DevicePrivateKeyBundleWithoutEpochStorageAuthKeyPair

export type VirtualDevicePublicKeyBundle = DevicePublicKeyBundleWithoutEpochStorageAuthKeyPair

// Common for "normal" and virtual devices

export type DeviceKeyBundleWithoutEpochStorageAuthKeyPair = {
    public: DevicePublicKeyBundleWithoutEpochStorageAuthKeyPair,
    private: DevicePrivateKeyBundleWithoutEpochStorageAuthKeyPair
}

export type DevicePublicKeyBundleWithoutEpochStorageAuthKeyPair = {
    deviceKeyPub: PublicKey

    epochStorageKeyPub: PublicKey
    epochStorageKeySig: Buffer
}

export type DevicePrivateKeyBundleWithoutEpochStorageAuthKeyPair = {
    deviceKeyPriv: PrivateKey

    epochStorageKeyPriv: PrivateKey
}

/**
 * Generates key bundle which consists of:
 * - device keys
 * - epoch storage keys
 * - epoch storage key signature (public key signed by private)
 * - epoch storage auth keys
 * - epoch storage auth key signatures (public key signed by private)
 *
 * @returns key bundle (private and shared parts)
 */
export function generateDeviceKeyBundle(): DeviceKeyBundle {
    const {priv_key_sig: deviceKeyPriv, pub_key_sig: deviceKeyPub} = pk_sig_keygen()
    const {priv_key_enc: epochStorageKeyPriv, pub_key_enc: epochStorageKeyPub} = pk_enc_keygen()
    const epochStorageKeySig = pk_sign(deviceKeyPriv, Buffer.of(0x30), epochStorageKeyPub.getPublicKeyBytes())

    const {priv_key_auth: epochStorageAuthKeyPriv, pub_key_auth: epochStorageAuthKeyPub} = pk_auth_keygen()
    const epochStorageAuthKeySig = pk_sign(deviceKeyPriv, Buffer.of(0x31), epochStorageAuthKeyPub.getPublicKeyBytes())

    const privateKeyBundle: DevicePrivateKeyBundle = {
        deviceKeyPriv,
        epochStorageAuthKeyPriv,
        epochStorageKeyPriv
    }

    const sharedKeyBundle: DevicePublicKeyBundle = {
        deviceKeyPub,
        epochStorageAuthKeyPub,
        epochStorageAuthKeySig,
        epochStorageKeyPub,
        epochStorageKeySig
    }

    return {
        private: privateKeyBundle,
        public: sharedKeyBundle
    }
}

export function generateVirtualDeviceKeyBundle(): VirtualDeviceKeyBundle {
    const {priv_key_sig: deviceKeyPriv, pub_key_sig: deviceKeyPub} = pk_sig_keygen()
    const {priv_key_enc: epochStorageKeyPriv, pub_key_enc: epochStorageKeyPub} = pk_enc_keygen()
    const epochStorageKeySig = pk_sign(deviceKeyPriv, Buffer.of(0x30), epochStorageKeyPub.getPublicKeyBytes())

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