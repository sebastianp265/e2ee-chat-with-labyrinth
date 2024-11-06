import {pk_sig_keygen, pk_sign} from "@/lib/labyrinth/crypto/signing.ts";
import {pk_auth_keygen, pk_enc_keygen} from "@/lib/labyrinth/crypto/public-key-encryption.ts";
import {openFirstEpoch, OpenFirstEpochWebClient} from "@/lib/labyrinth/epoch/open-new-epoch.ts";
import {VirtualDevice} from "@/lib/labyrinth/device/virtual-device.ts";
import {PrivateKey, PublicKey} from "@/lib/labyrinth/crypto/keys.ts";

// Common for "normal" and virtual devices

export type DeviceKeyBundleWithoutEpochStorageAuthKeyPair = {
    public: DevicePublicKeyBundleWithoutEpochStorageAuthKeyPair,
    private: DevicePrivateKeyBundleWithoutEpochStorageAuthKeyPair
}

export type DevicePublicKeyBundleWithoutEpochStorageAuthKeyPair = {
    deviceKeyPub: PublicKey

    epochStorageKeyPub: PublicKey
    epochStorageKeySig: Uint8Array
}

export type DevicePrivateKeyBundleWithoutEpochStorageAuthKeyPair = {
    deviceKeyPriv: PrivateKey

    epochStorageKeyPriv: PrivateKey
}

// Devices

export type ThisDeviceSerialized = {
    id: string,
    keyBundle: {
        public: {
            deviceKeyPub: Uint8Array,

            epochStorageKeyPub: Uint8Array,
            epochStorageKeySig: Uint8Array

            epochStorageAuthKeyPub: Uint8Array,
            epochStorageAuthKeySig: Uint8Array,
        },
        private: {
            deviceKeyPriv: Uint8Array,

            epochStorageKeyPriv: Uint8Array,

            epochStorageAuthKeyPriv: Uint8Array,
        }
    }
}

export type DeviceKeyBundle = {
    public: DevicePublicKeyBundle
    private: DevicePrivateKeyBundle
}

// "Normal" devices have additional pair of keys used for sending new epoch entropy via public key encryption
export type DevicePublicKeyBundle = DevicePublicKeyBundleWithoutEpochStorageAuthKeyPair & {
    epochStorageAuthKeyPub: PublicKey
    epochStorageAuthKeySig: Uint8Array
}

// "Normal" devices have additional pair of keys used for sending new epoch entropy via public key encryption
export type DevicePrivateKeyBundle = DevicePrivateKeyBundleWithoutEpochStorageAuthKeyPair & {
    epochStorageAuthKeyPriv: PrivateKey
}

export type UploadDevicePublicKeyBundleResponse = {
    assignedDeviceID: string,
}

export type UploadDevicePublicKeyBundleWebClient = {
    uploadDevicePublicKeyBundle: (devicePublicKeyBundle: DevicePublicKeyBundle) => Promise<UploadDevicePublicKeyBundleResponse>
}

export class ThisDevice {
    public readonly id: string
    public readonly keyBundle: DeviceKeyBundle

    private constructor(id: string, keyBundle: DeviceKeyBundle) {
        this.id = id
        this.keyBundle = keyBundle
    }

    public static deserialize(thisDeviceSerialized: ThisDeviceSerialized): ThisDevice {
        return new ThisDevice(thisDeviceSerialized.id, {
            public: {
                deviceKeyPub: PublicKey.deserialize(thisDeviceSerialized.keyBundle.public.deviceKeyPub),

                epochStorageKeyPub: PublicKey.deserialize(thisDeviceSerialized.keyBundle.public.epochStorageKeyPub),
                epochStorageKeySig: thisDeviceSerialized.keyBundle.public.epochStorageKeySig,

                epochStorageAuthKeyPub: PublicKey.deserialize(thisDeviceSerialized.keyBundle.public.epochStorageAuthKeyPub),
                epochStorageAuthKeySig: thisDeviceSerialized.keyBundle.public.epochStorageAuthKeySig
            },
            private: {
                deviceKeyPriv: PrivateKey.deserialize(thisDeviceSerialized.keyBundle.private.deviceKeyPriv),

                epochStorageKeyPriv: PrivateKey.deserialize(thisDeviceSerialized.keyBundle.private.epochStorageKeyPriv),
                epochStorageAuthKeyPriv: PrivateKey.deserialize(thisDeviceSerialized.keyBundle.private.epochStorageAuthKeyPriv),
            }
        })
    }

    public serialize(): ThisDeviceSerialized {
        return {
            id: this.id,
            keyBundle: {
                public: {
                    deviceKeyPub: this.keyBundle.public.deviceKeyPub.serialize(),

                    epochStorageKeyPub: this.keyBundle.public.epochStorageKeyPub.serialize(),
                    epochStorageKeySig: this.keyBundle.public.epochStorageKeySig,

                    epochStorageAuthKeyPub: this.keyBundle.public.epochStorageAuthKeyPub.serialize(),
                    epochStorageAuthKeySig: this.keyBundle.public.epochStorageAuthKeySig,
                },
                private: {
                    deviceKeyPriv: this.keyBundle.private.deviceKeyPriv.serialize(),

                    epochStorageKeyPriv: this.keyBundle.private.epochStorageKeyPriv.serialize(),
                    epochStorageAuthKeyPriv: this.keyBundle.private.epochStorageAuthKeyPriv.serialize(),
                }
            }
        }
    }

    public static async fromFirstEpoch(virtualDevice: VirtualDevice,
                                       virtualDeviceDecryptionKey: Uint8Array,
                                       labyrinthWebClient: OpenFirstEpochWebClient) {
        const deviceKeyBundle = generateDeviceKeyBundle()

        const {
            deviceID,
            firstEpoch
        } = await openFirstEpoch(
            deviceKeyBundle.public,
            virtualDeviceDecryptionKey,
            virtualDevice,
            labyrinthWebClient
        )

        const thisDevice = new ThisDevice(deviceID, deviceKeyBundle)

        return {
            thisDevice,
            firstEpoch
        }
    }

    public static async fromRecoveryCode(webClient: UploadDevicePublicKeyBundleWebClient) {
        const deviceKeyBundle = generateDeviceKeyBundle()

        const {assignedDeviceID} = await webClient.uploadDevicePublicKeyBundle(deviceKeyBundle.public)

        return new ThisDevice(assignedDeviceID, deviceKeyBundle)
    }
}

function generateDeviceKeyBundle(): DeviceKeyBundle {
    const {privateKey: deviceKeyPriv, publicKey: deviceKeyPub} = pk_sig_keygen()
    const {privateKey: epochStorageKeyPriv, publicKey: epochStorageKeyPub} = pk_enc_keygen()
    const epochStorageKeySig = pk_sign(deviceKeyPriv, Uint8Array.of(0x30), epochStorageKeyPub.getPublicKeyBytes())

    const {privateKey: epochStorageAuthKeyPriv, publicKey: epochStorageAuthKeyPub} = pk_auth_keygen()
    const epochStorageAuthKeySig = pk_sign(deviceKeyPriv, Uint8Array.of(0x31), epochStorageAuthKeyPub.getPublicKeyBytes())

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

