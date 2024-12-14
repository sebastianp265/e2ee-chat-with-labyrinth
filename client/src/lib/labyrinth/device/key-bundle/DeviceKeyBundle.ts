import {
    CommonPrivateKeyBundle,
    CommonPublicKeyBundle,
    CommonPublicKeyBundleSerialized,
} from '@/lib/labyrinth/device/key-bundle/DeviceAndVirtualDeviceCommonKeyBundle.ts';
import { PrivateKey, PublicKey } from '@/lib/labyrinth/crypto/keys.ts';
import { BytesSerializer } from '@/lib/labyrinth/BytesSerializer.ts';

export type DeviceKeyBundleSerialized = {
    priv: DevicePrivateKeyBundleSerialized;
    pub: DevicePublicKeyBundleSerialized;
};

export class DeviceKeyBundle {
    public readonly priv: DevicePrivateKeyBundle;
    public readonly pub: DevicePublicKeyBundle;

    private constructor(
        priv: DevicePrivateKeyBundle,
        pub: DevicePublicKeyBundle,
    ) {
        this.priv = priv;
        this.pub = pub;
    }

    public static generate(): DeviceKeyBundle {
        const priv = DevicePrivateKeyBundle.generate();

        return new DeviceKeyBundle(priv, priv.getPublicKeyBundle());
    }

    public serialize(): DeviceKeyBundleSerialized {
        return {
            priv: this.priv.serialize(),
            pub: this.pub.serialize(),
        };
    }

    public static deserialize(
        serialized: DeviceKeyBundleSerialized,
    ): DeviceKeyBundle {
        const { priv, pub } = serialized;

        return new DeviceKeyBundle(
            DevicePrivateKeyBundle.deserialize(priv),
            DevicePublicKeyBundle.deserialize(pub),
        );
    }
}

export type DevicePrivateKeyBundleSerialized = {
    deviceKeyPriv: string;

    epochStorageKeyPriv: string;
    epochStorageAuthKeyPriv: string;
};

export class DevicePrivateKeyBundle extends CommonPrivateKeyBundle {
    public readonly epochStorageAuthKeyPriv: PrivateKey;

    private constructor(
        deviceKeyPriv: PrivateKey,
        epochStorageKeyPriv: PrivateKey,
        epochStorageAuthKeyPriv: PrivateKey,
    ) {
        super(deviceKeyPriv, epochStorageKeyPriv);
        this.epochStorageAuthKeyPriv = epochStorageAuthKeyPriv;
    }

    public static generate(): DevicePrivateKeyBundle {
        return new DevicePrivateKeyBundle(
            PrivateKey.generate(),
            PrivateKey.generate(),
            PrivateKey.generate(),
        );
    }

    public serialize(): DevicePrivateKeyBundleSerialized {
        return {
            deviceKeyPriv: this.deviceKeyPriv.serialize(),

            epochStorageKeyPriv: this.epochStorageKeyPriv.serialize(),
            epochStorageAuthKeyPriv: this.epochStorageAuthKeyPriv.serialize(),
        };
    }

    public static deserialize(
        devicePrivateKeyBundleSerialized: DevicePrivateKeyBundleSerialized,
    ): DevicePrivateKeyBundle {
        const { deviceKeyPriv, epochStorageKeyPriv, epochStorageAuthKeyPriv } =
            devicePrivateKeyBundleSerialized;

        return new DevicePrivateKeyBundle(
            PrivateKey.deserialize(deviceKeyPriv),
            PrivateKey.deserialize(epochStorageKeyPriv),
            PrivateKey.deserialize(epochStorageAuthKeyPriv),
        );
    }

    public getPublicKeyBundle(): DevicePublicKeyBundle {
        const { deviceKeyPub, epochStorageKeyPub, epochStorageKeySig } =
            super.getPublicKeyBundle();
        const epochStorageAuthKeyPub =
            this.epochStorageAuthKeyPriv.getPublicKey();

        return new DevicePublicKeyBundle(
            deviceKeyPub,

            epochStorageKeyPub,
            epochStorageKeySig,

            epochStorageAuthKeyPub,
            this.deviceKeyPriv.sign(
                Uint8Array.of(0x31),
                epochStorageAuthKeyPub.getX25519PublicKeyBytes(),
            ),
        );
    }
}

export type DevicePublicKeyBundleSerialized =
    CommonPublicKeyBundleSerialized & {
        epochStorageAuthKeyPub: string;
        epochStorageAuthKeySig: string;
    };

export class DevicePublicKeyBundle extends CommonPublicKeyBundle {
    public readonly epochStorageAuthKeyPub: PublicKey;
    public readonly epochStorageAuthKeySig: Uint8Array;

    public constructor(
        deviceKeyPub: PublicKey,
        epochStorageKeyPub: PublicKey,
        epochStorageKeySig: Uint8Array,
        epochStorageAuthKeyPub: PublicKey,
        epochStorageAuthKeySig: Uint8Array,
    ) {
        super(deviceKeyPub, epochStorageKeyPub, epochStorageKeySig);

        this.epochStorageAuthKeyPub = epochStorageAuthKeyPub;
        this.epochStorageAuthKeySig = epochStorageAuthKeySig;
    }

    public serialize(): DevicePublicKeyBundleSerialized {
        return {
            ...super.serialize(),
            epochStorageAuthKeyPub: this.epochStorageAuthKeyPub.serialize(),
            epochStorageAuthKeySig: BytesSerializer.serialize(
                this.epochStorageAuthKeySig,
            ),
        };
    }

    public static deserialize(
        devicePublicKeyBundleSerialized: DevicePublicKeyBundleSerialized,
    ) {
        const {
            deviceKeyPub,

            epochStorageKeyPub,
            epochStorageKeySig,

            epochStorageAuthKeyPub,
            epochStorageAuthKeySig,
        } = devicePublicKeyBundleSerialized;

        return new DevicePublicKeyBundle(
            PublicKey.deserialize(deviceKeyPub),

            PublicKey.deserialize(epochStorageKeyPub),
            BytesSerializer.deserialize(epochStorageKeySig),

            PublicKey.deserialize(epochStorageAuthKeyPub),
            BytesSerializer.deserialize(epochStorageAuthKeySig),
        );
    }
}
