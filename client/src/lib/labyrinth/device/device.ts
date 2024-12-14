import {
    openFirstEpoch,
    OpenFirstEpochWebClient,
} from '@/lib/labyrinth/epoch/open-new-epoch.ts';
import {
    DeviceKeyBundle,
    DeviceKeyBundleSerialized,
    DevicePublicKeyBundleSerialized,
} from '@/lib/labyrinth/device/key-bundle/DeviceKeyBundle.ts';
import { VirtualDevice } from '@/lib/labyrinth/device/virtual-device/VirtualDevice.ts';
import { BytesSerializer } from '@/lib/labyrinth/BytesSerializer.ts';
import { generateEpochDeviceMac } from '@/lib/labyrinth/epoch/authenticate-device-to-epoch.ts';
import { Epoch } from '@/lib/labyrinth/epoch/EpochStorage.ts';

export type AuthenticateDeviceToEpochAndRegisterDeviceResponse = {
    assignedDeviceId: string;
};

export type AuthenticateDeviceToEpochAndRegisterDeviceRequestBody = {
    devicePublicKeyBundle: DevicePublicKeyBundleSerialized;
    epochDeviceMac: string;
};

export type AuthenticateDeviceToEpochAndRegisterDeviceWebClient = {
    authenticateDeviceToEpochAndRegisterDevice: (
        epochId: string,
        requestBody: AuthenticateDeviceToEpochAndRegisterDeviceRequestBody,
    ) => Promise<AuthenticateDeviceToEpochAndRegisterDeviceResponse>;
};

export type ThisDeviceSerialized = {
    id: string;
    keyBundle: DeviceKeyBundleSerialized;
};

export class ThisDevice {
    public readonly id: string;
    public readonly keyBundle: DeviceKeyBundle;

    private constructor(id: string, keyBundle: DeviceKeyBundle) {
        this.id = id;
        this.keyBundle = keyBundle;
    }

    public static deserialize(
        thisDeviceSerialized: ThisDeviceSerialized,
    ): ThisDevice {
        return new ThisDevice(
            thisDeviceSerialized.id,
            DeviceKeyBundle.deserialize(thisDeviceSerialized.keyBundle),
        );
    }

    public serialize(): ThisDeviceSerialized {
        return {
            id: this.id,
            keyBundle: this.keyBundle.serialize(),
        };
    }

    public static async fromFirstEpoch(
        virtualDevice: VirtualDevice,
        virtualDeviceDecryptionKey: Uint8Array,
        labyrinthWebClient: OpenFirstEpochWebClient,
    ) {
        const deviceKeyBundle = DeviceKeyBundle.generate();

        const { deviceId, firstEpoch } = await openFirstEpoch(
            deviceKeyBundle.pub,
            virtualDeviceDecryptionKey,
            virtualDevice,
            labyrinthWebClient,
        );

        const thisDevice = new ThisDevice(deviceId, deviceKeyBundle);

        return {
            thisDevice,
            firstEpoch,
        };
    }

    public static async fromRecoveryCode(
        newestRecoveredEpoch: Epoch,
        webClient: AuthenticateDeviceToEpochAndRegisterDeviceWebClient,
    ) {
        const deviceKeyBundle = DeviceKeyBundle.generate();

        const { assignedDeviceId } =
            await webClient.authenticateDeviceToEpochAndRegisterDevice(
                newestRecoveredEpoch.id,
                {
                    devicePublicKeyBundle: deviceKeyBundle.pub.serialize(),
                    epochDeviceMac: BytesSerializer.serialize(
                        await generateEpochDeviceMac(
                            newestRecoveredEpoch,
                            deviceKeyBundle.pub.deviceKeyPub,
                        ),
                    ),
                },
            );

        return new ThisDevice(assignedDeviceId, deviceKeyBundle);
    }
}
