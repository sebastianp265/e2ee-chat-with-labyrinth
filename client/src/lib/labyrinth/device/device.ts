import {openFirstEpoch, OpenFirstEpochWebClient} from "@/lib/labyrinth/epoch/open-new-epoch.ts";
import {
    DeviceKeyBundle,
    DeviceKeyBundleSerialized,
    DevicePublicKeyBundleSerialized
} from "@/lib/labyrinth/device/key-bundle/DeviceKeyBundle.ts";
import {VirtualDevice} from "@/lib/labyrinth/device/virtual-device/VirtualDevice.ts";

export type UploadDevicePublicKeyBundleResponse = {
    assignedDeviceID: string,
}

export type UploadDevicePublicKeyBundleWebClient = {
    uploadDevicePublicKeyBundle: (devicePublicKeyBundle: DevicePublicKeyBundleSerialized) => Promise<UploadDevicePublicKeyBundleResponse>
}

export type ThisDeviceSerialized = {
    id: string,
    keyBundle: DeviceKeyBundleSerialized
}

export class ThisDevice {
    public readonly id: string
    public readonly keyBundle: DeviceKeyBundle

    private constructor(id: string, keyBundle: DeviceKeyBundle) {
        this.id = id
        this.keyBundle = keyBundle
    }

    public static deserialize(thisDeviceSerialized: ThisDeviceSerialized): ThisDevice {
        return new ThisDevice(
            thisDeviceSerialized.id,
            DeviceKeyBundle.deserialize(thisDeviceSerialized.keyBundle)
        )
    }

    public serialize(): ThisDeviceSerialized {
        return {
            id: this.id,
            keyBundle: this.keyBundle.serialize(),
        }
    }

    public static async fromFirstEpoch(virtualDevice: VirtualDevice,
                                       virtualDeviceDecryptionKey: Uint8Array,
                                       labyrinthWebClient: OpenFirstEpochWebClient) {
        const deviceKeyBundle = DeviceKeyBundle.generate()

        const {
            deviceID,
            firstEpoch,
            inboxID,
        } = await openFirstEpoch(
            deviceKeyBundle.pub,
            virtualDeviceDecryptionKey,
            virtualDevice,
            labyrinthWebClient
        )

        const thisDevice = new ThisDevice(deviceID, deviceKeyBundle)

        return {
            thisDevice,
            firstEpoch,
            inboxID,
        }
    }

    public static async fromRecoveryCode(webClient: UploadDevicePublicKeyBundleWebClient) {
        const deviceKeyBundle = DeviceKeyBundle.generate()

        const {assignedDeviceID} = await webClient.uploadDevicePublicKeyBundle(deviceKeyBundle.pub.serialize())

        return new ThisDevice(assignedDeviceID, deviceKeyBundle)
    }
}