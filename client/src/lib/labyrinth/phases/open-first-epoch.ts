import { random } from '@/lib/labyrinth/crypto/utils.ts';
import { generateEpochDeviceMac } from '@/lib/labyrinth/phases/authenticate-device-to-epoch.ts';
import { Epoch, EpochWithoutId } from '@/lib/labyrinth/EpochStorage.ts';
import {
    DevicePublicKeyBundle,
    DevicePublicKeyBundleSerialized,
} from '@/lib/labyrinth/device/key-bundle/DeviceKeyBundle.ts';
import { VirtualDevice } from '@/lib/labyrinth/device/virtual-device/VirtualDevice.ts';
import {
    encryptVirtualDeviceRecoverySecrets,
    VirtualDeviceEncryptedRecoverySecretsSerialized,
} from '@/lib/labyrinth/device/virtual-device/VirtualDeviceEncryptedRecoverySecrets.ts';
import { VirtualDevicePublicKeyBundleSerialized } from '@/lib/labyrinth/device/key-bundle/VirtualDeviceKeyBundle.ts';
import { BytesSerializer } from '@/lib/labyrinth/BytesSerializer.ts';

export type OpenFirstEpochBody = {
    virtualDeviceId: string;
    virtualDeviceEncryptedRecoverySecrets: VirtualDeviceEncryptedRecoverySecretsSerialized;
    virtualDevicePublicKeyBundle: VirtualDevicePublicKeyBundleSerialized;
    devicePublicKeyBundle: DevicePublicKeyBundleSerialized;
    firstEpochMembershipProof: {
        epochDeviceMac: string;
        epochVirtualDeviceMac: string;
    };
};

export type OpenFirstEpochResponse = {
    deviceId: string;
    epochId: string;
};

export type OpenFirstEpochWebClient = {
    openFirstEpoch: (
        requestBody: OpenFirstEpochBody,
    ) => Promise<OpenFirstEpochResponse>;
};

export async function openFirstEpoch(
    devicePublicKeyBundle: DevicePublicKeyBundle,
    virtualDeviceDecryptionKey: Uint8Array,
    virtualDevice: VirtualDevice,
    webClient: OpenFirstEpochWebClient,
) {
    const firstEpochWithoutId: EpochWithoutId = {
        sequenceId: '0',
        rootKey: random(32),
    };

    const epochVirtualDeviceMac = await generateEpochDeviceMac(
        firstEpochWithoutId,
        virtualDevice.keyBundle.pub.deviceKeyPub,
    );

    const epochThisDeviceMac = await generateEpochDeviceMac(
        firstEpochWithoutId,
        devicePublicKeyBundle.deviceKeyPub,
    );

    const virtualDeviceEncryptedRecoverySecrets =
        await encryptVirtualDeviceRecoverySecrets(
            virtualDeviceDecryptionKey,
            firstEpochWithoutId,
            virtualDevice.keyBundle.priv,
        );

    const openFirstEpochResponse = await webClient.openFirstEpoch({
        virtualDeviceId: BytesSerializer.serialize(virtualDevice.id),
        firstEpochMembershipProof: {
            epochDeviceMac: BytesSerializer.serialize(epochThisDeviceMac),
            epochVirtualDeviceMac: BytesSerializer.serialize(
                epochVirtualDeviceMac,
            ),
        },
        devicePublicKeyBundle: devicePublicKeyBundle.serialize(),
        virtualDevicePublicKeyBundle: virtualDevice.keyBundle.pub.serialize(),
        virtualDeviceEncryptedRecoverySecrets:
            virtualDeviceEncryptedRecoverySecrets.serialize(),
    });

    const firstEpoch = {
        id: openFirstEpochResponse.epochId,
        ...firstEpochWithoutId,
    } as Epoch;

    return {
        deviceId: openFirstEpochResponse.deviceId,
        firstEpoch,
    };
}
