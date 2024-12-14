import {
    CommonPrivateKeyBundle,
    CommonPublicKeyBundle,
    CommonPublicKeyBundleSerialized,
} from '@/lib/labyrinth/device/key-bundle/DeviceAndVirtualDeviceCommonKeyBundle.ts';

export class VirtualDeviceKeyBundle {
    public readonly priv: VirtualDevicePrivateKeyBundle;
    public readonly pub: VirtualDevicePublicKeyBundle;

    public constructor(
        priv: VirtualDevicePrivateKeyBundle,
        pub: VirtualDevicePublicKeyBundle,
    ) {
        this.priv = priv;
        this.pub = pub;
    }

    public static generate(): VirtualDeviceKeyBundle {
        const priv = VirtualDevicePrivateKeyBundle.generate();

        return new VirtualDeviceKeyBundle(priv, priv.getPublicKeyBundle());
    }
}

export class VirtualDevicePrivateKeyBundle extends CommonPrivateKeyBundle {}

export type VirtualDevicePublicKeyBundleSerialized =
    CommonPublicKeyBundleSerialized;

export class VirtualDevicePublicKeyBundle extends CommonPublicKeyBundle {}
