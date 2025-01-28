import {
    openFirstEpoch,
    OpenFirstEpochServerClient,
} from '@/lib/labyrinth/phases/open-first-epoch.ts';
import {
    DeviceKeyBundle,
    DeviceKeyBundleSerialized,
    DevicePublicKeyBundleSerialized,
} from '@/lib/labyrinth/device/key-bundle/DeviceKeyBundle.ts';
import { VirtualDevice } from '@/lib/labyrinth/device/virtual-device/VirtualDevice.ts';
import { BytesSerializer } from '@/lib/labyrinth/BytesSerializer.ts';
import { generateEpochDeviceMac } from '@/lib/labyrinth/phases/authenticate-device-to-epoch.ts';
import { Epoch, EpochStorage } from '@/lib/labyrinth/EpochStorage.ts';
import { joinAllEpochs } from '@/lib/labyrinth/phases/join-epoch.ts';
import { LabyrinthServerClient } from '@/lib/labyrinth/labyrinth-server-client.ts';

export type AuthenticateDeviceToEpochAndRegisterDeviceResponse = {
    assignedDeviceId: string;
};

export type AuthenticateDeviceToEpochAndRegisterDeviceRequestBody = {
    devicePublicKeyBundle: DevicePublicKeyBundleSerialized;
    epochDeviceMac: string;
};

export type AuthenticateDeviceToEpochAndRegisterDeviceServerClient = {
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

    public static async deserialize(
        thisDeviceSerialized: ThisDeviceSerialized,
        epochStorage: EpochStorage,
        labyrinthServerClient: LabyrinthServerClient,
    ): Promise<ThisDevice> {
        const thisDevice = new ThisDevice(
            thisDeviceSerialized.id,
            DeviceKeyBundle.deserialize(thisDeviceSerialized.keyBundle),
        );

        const newestEpochSequenceIdBefore =
            epochStorage.getNewestEpoch().sequenceId;
        await joinAllEpochs(thisDevice, epochStorage, labyrinthServerClient);
        const newestEpochAfter = epochStorage.getNewestEpoch();

        if (newestEpochSequenceIdBefore != newestEpochAfter.sequenceId) {
            await labyrinthServerClient.authenticateDeviceToEpoch(
                newestEpochAfter.id,
                thisDevice.id,
                {
                    epochDeviceMac: BytesSerializer.serialize(
                        await generateEpochDeviceMac(
                            newestEpochAfter,
                            thisDevice.keyBundle.pub.deviceKeyPub,
                        ),
                    ),
                },
            );
        }

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

    public static async initialize(
        virtualDevice: VirtualDevice,
        virtualDeviceDecryptionKey: Uint8Array,
        labyrinthWebClient: OpenFirstEpochServerClient,
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
        webClient: AuthenticateDeviceToEpochAndRegisterDeviceServerClient,
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
