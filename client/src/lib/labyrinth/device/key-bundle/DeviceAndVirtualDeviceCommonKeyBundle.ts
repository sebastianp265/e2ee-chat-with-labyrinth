import { PrivateKey, PublicKey } from '@/lib/labyrinth/crypto/keys.ts';
import { BytesSerializer } from '@/lib/labyrinth/BytesSerializer.ts';

export class CommonPrivateKeyBundle {
    public readonly deviceKeyPriv: PrivateKey;

    public readonly epochStorageKeyPriv: PrivateKey;

    public constructor(
        deviceKeyPriv: PrivateKey,
        epochStorageKeyPriv: PrivateKey,
    ) {
        this.deviceKeyPriv = deviceKeyPriv;
        this.epochStorageKeyPriv = epochStorageKeyPriv;
    }

    public static generate(): CommonPrivateKeyBundle {
        return new CommonPrivateKeyBundle(
            PrivateKey.generate(),
            PrivateKey.generate(),
        );
    }

    public getPublicKeyBundle(): CommonPublicKeyBundle {
        const epochStorageKeyPub = this.epochStorageKeyPriv.getPublicKey();

        return new CommonPublicKeyBundle(
            this.deviceKeyPriv.getPublicKey(),

            epochStorageKeyPub,
            this.deviceKeyPriv.sign(
                Uint8Array.of(0x30),
                epochStorageKeyPub.getX25519PublicKeyBytes(),
            ),
        );
    }
}

export type CommonPublicKeyBundleSerialized = {
    deviceKeyPub: string;

    epochStorageKeyPub: string;
    epochStorageKeySig: string;
};

export class CommonPublicKeyBundle {
    public readonly deviceKeyPub: PublicKey;

    public readonly epochStorageKeyPub: PublicKey;
    public readonly epochStorageKeySig: Uint8Array;

    public constructor(
        deviceKeyPub: PublicKey,
        epochStorageKeyPub: PublicKey,
        epochStorageKeySig: Uint8Array,
    ) {
        this.deviceKeyPub = deviceKeyPub;

        this.epochStorageKeyPub = epochStorageKeyPub;
        this.epochStorageKeySig = epochStorageKeySig;
    }

    public serialize(): CommonPublicKeyBundleSerialized {
        return {
            deviceKeyPub: this.deviceKeyPub.serialize(),

            epochStorageKeyPub: this.epochStorageKeyPub.serialize(),
            epochStorageKeySig: BytesSerializer.serialize(
                this.epochStorageKeySig,
            ),
        };
    }

    public static deserialize(
        devicePublicKeyBundleSerialized: CommonPublicKeyBundleSerialized,
    ): CommonPublicKeyBundle {
        const { deviceKeyPub, epochStorageKeyPub, epochStorageKeySig } =
            devicePublicKeyBundleSerialized;

        return new CommonPublicKeyBundle(
            PublicKey.deserialize(deviceKeyPub),

            PublicKey.deserialize(epochStorageKeyPub),
            BytesSerializer.deserialize(epochStorageKeySig),
        );
    }
}
