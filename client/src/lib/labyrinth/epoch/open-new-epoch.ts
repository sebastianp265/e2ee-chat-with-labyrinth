import {kdf_one_key, kdf_two_keys} from "@/lib/labyrinth/crypto/key-derivation.ts";
import {encode, encodeToBase64, random} from "@/lib/labyrinth/crypto/utils.ts";
import {encrypt} from "@/lib/labyrinth/crypto/authenticated-symmetric-encryption.ts";
import {pk_verify} from "@/lib/labyrinth/crypto/signing.ts";
import {pk_encrypt} from "@/lib/labyrinth/crypto/public-key-encryption.ts";
import {
    encryptVirtualDeviceRecoverSecrets,
    VirtualDevice,
    VirtualDeviceEncryptedRecoverSecrets
} from "@/lib/labyrinth/device/virtual-device.ts";
import {
    DevicePublicKeyBundle,
    DevicePublicKeyBundleWithoutEpochStorageAuthKeyPair,
    ThisDevice,
} from "@/lib/labyrinth/device/device.ts";
import {generateEpochDeviceMac} from "@/lib/labyrinth/epoch/authenticate-device-to-epoch.ts";
import {Epoch, EpochWithoutID} from "@/lib/labyrinth/epoch/EpochStorage.ts";

export type OpenFirstEpochBody = {
    virtualDeviceID: string,
    virtualDeviceEncryptedRecoverySecrets: VirtualDeviceEncryptedRecoverSecrets,
    firstEpochMembershipProof: {
        epochThisDeviceMac: Uint8Array,
        epochVirtualDeviceMac: Uint8Array
    }
}

export type OpenFirstEpochResponse = {
    deviceID: string,
    epochID: string
}

export type OpenFirstEpochWebClient = {
    // returns assigned epoch id
    openFirstEpoch: (requestBody: OpenFirstEpochBody) => Promise<OpenFirstEpochResponse>
}

export async function openFirstEpoch(devicePublicKeyBundle: DevicePublicKeyBundle,
                                     virtualDeviceDecryptionKey: Uint8Array,
                                     virtualDevice: VirtualDevice,
                                     webClient: OpenFirstEpochWebClient) {
    const firstEpochWithoutID: EpochWithoutID = {
        sequenceID: "0",
        rootKey: random(32)
    }

    const epochVirtualDeviceMac = await generateEpochDeviceMac(
        firstEpochWithoutID,
        virtualDevice.keyBundle.public.deviceKeyPub
    )

    const epochThisDeviceMac = await generateEpochDeviceMac(
        firstEpochWithoutID,
        devicePublicKeyBundle.deviceKeyPub
    )

    const virtualDeviceEncryptedRecoverySecrets = await encryptVirtualDeviceRecoverSecrets(
        virtualDeviceDecryptionKey,
        firstEpochWithoutID,
        virtualDevice.keyBundle
    )

    const openFirstEpochResponse = await webClient.openFirstEpoch({
        virtualDeviceID: virtualDevice.id,
        firstEpochMembershipProof: {
            epochThisDeviceMac,
            epochVirtualDeviceMac
        },
        virtualDeviceEncryptedRecoverySecrets
    })

    const firstEpoch = {
        id: openFirstEpochResponse.epochID,
        ...firstEpochWithoutID
    } as Epoch

    return {
        deviceID: openFirstEpochResponse.deviceID,
        firstEpoch
    }
}

type DeviceInEpoch = {
    id: string,
} & VirtualDeviceInEpoch

type VirtualDeviceInEpoch = {
    mac: Uint8Array,
    keyBundle: DevicePublicKeyBundleWithoutEpochStorageAuthKeyPair
}

export type GetDevicesInEpochResponse = {
    devices: DeviceInEpoch[]
    virtualDevice: VirtualDeviceInEpoch
}


type EncryptedNewEpochEntropyForEveryDeviceInEpoch = {
    deviceIDToEncryptedNewEpochEntropyMap: {
        [deviceID: string]: Uint8Array,
    },
    virtualDeviceEncryptedNewEpochEntropy: Uint8Array,
}

type EncryptedCurrentEpochJoinData = {
    encryptedEpochSequenceID: Uint8Array,
    encryptedEpochRootKey: Uint8Array,
}

export type OpenNewEpochBasedOnCurrentBody = {
    encryptedNewEpochEntropyForEveryDeviceInEpoch: EncryptedNewEpochEntropyForEveryDeviceInEpoch
    newEpochMembershipProof: {
        epochThisDeviceMac: Uint8Array,
        epochVirtualDeviceMac: Uint8Array,
    },
    encryptedCurrentEpochJoinData: EncryptedCurrentEpochJoinData
}

export type OpenNewEpochBasedOnCurrentResponse = {
    openedEpochID: string
}

export type OpenNewEpochBasedOnCurrentWebClient = {
    getDevicesInEpoch: (epochID: string) => Promise<GetDevicesInEpochResponse>
    openNewEpochBasedOnCurrent: (currentEpochID: string, requestBody: OpenNewEpochBasedOnCurrentBody) => Promise<OpenNewEpochBasedOnCurrentResponse>
}

export async function openNewEpochBasedOnCurrent(currentEpoch: Epoch,
                                                 webClient: OpenNewEpochBasedOnCurrentWebClient,
                                                 thisDevice: ThisDevice): Promise<Epoch> {
    const devicesInEpochPromise = webClient.getDevicesInEpoch(currentEpoch.id)
    const [epochChainingKey, epochDistributionPreSharedKey] = await kdf_two_keys(
        currentEpoch.rootKey,
        Uint8Array.of(),
        encode(`epoch_chaining_${currentEpoch.sequenceID}_${currentEpoch.id}`)
    )

    const newEpochEntropy = random(32)
    const newEpochWithoutID: EpochWithoutID = {
        rootKey: await kdf_one_key(
            newEpochEntropy,
            epochChainingKey,
            encode("epoch_root_key")
        ),
        sequenceID: (BigInt(currentEpoch.sequenceID) + 1n).toString()
    }

    const devicesInEpoch = await devicesInEpochPromise

    const {openedEpochID} = await webClient.openNewEpochBasedOnCurrent(currentEpoch.id, {
            encryptedNewEpochEntropyForEveryDeviceInEpoch: await encryptNewEpochEntropyForEveryDeviceInEpoch(
                currentEpoch,
                newEpochWithoutID,
                thisDevice,
                devicesInEpoch,
                epochDistributionPreSharedKey,
                newEpochEntropy
            ),
            newEpochMembershipProof: {
                epochThisDeviceMac: await generateEpochDeviceMac(
                    newEpochWithoutID,
                    thisDevice.keyBundle.public.deviceKeyPub,
                ),
                epochVirtualDeviceMac: await generateEpochDeviceMac(
                    newEpochWithoutID,
                    devicesInEpoch.virtualDevice.keyBundle.deviceKeyPub,
                )
            },
            encryptedCurrentEpochJoinData: await encryptCurrentEpochJoinData(
                currentEpoch,
                newEpochWithoutID
            ),
        }
    )

    return {
        id: openedEpochID,
        sequenceID: newEpochWithoutID.sequenceID,
        rootKey: newEpochWithoutID.rootKey
    }
}

async function encryptCurrentEpochJoinData(currentEpoch: Epoch,
                                           newEpochWithoutID: EpochWithoutID): Promise<EncryptedCurrentEpochJoinData> {
    const newEpochDataStorageKey = await kdf_one_key(
        newEpochWithoutID.rootKey,
        Uint8Array.of(),
        encode(`epoch_data_storage_${encodeToBase64(newEpochWithoutID.sequenceID)}`)
    )

    const encryptedCurrentEpochSequenceID = await encrypt(
        newEpochDataStorageKey,
        encode("epoch_data_metadata"),
        encode(currentEpoch.sequenceID)
    )

    const encryptedCurrentEpochRootKey = await encrypt(
        newEpochDataStorageKey,
        encode("epoch_data_metadata"),
        currentEpoch.rootKey
    )

    return {
        encryptedEpochSequenceID: encryptedCurrentEpochSequenceID,
        encryptedEpochRootKey: encryptedCurrentEpochRootKey,
    }
}

export class InvalidVirtualDeviceServerRepresentationError extends Error {

    constructor() {
        super("Epoch can't be opened when virtual device server representation is invalid");

        Object.setPrototypeOf(this, InvalidVirtualDeviceServerRepresentationError.prototype);
    }
}

async function encryptNewEpochEntropyForEveryDeviceInEpoch(currentEpoch: Epoch,
                                                           newEpochWithoutID: EpochWithoutID,
                                                           thisDevice: ThisDevice,
                                                           devicesInEpoch: GetDevicesInEpochResponse,
                                                           epochDistributionPreSharedKey: Uint8Array,
                                                           newEpochEntropy: Uint8Array): Promise<EncryptedNewEpochEntropyForEveryDeviceInEpoch> {

    async function encryptNewEpochEntropyForDeviceInEpoch(deviceInEpoch: VirtualDeviceInEpoch | DeviceInEpoch) {
        const expectedEpochDeviceMac = await generateEpochDeviceMac(
            currentEpoch,
            deviceInEpoch.keyBundle.deviceKeyPub
        )
        if (deviceInEpoch.mac !== expectedEpochDeviceMac) {
            return null
        }

        const isValidEpochStorageKey = pk_verify(
            deviceInEpoch.keyBundle.deviceKeyPub,
            deviceInEpoch.keyBundle.epochStorageKeySig,
            Uint8Array.of(0x30),
            deviceInEpoch.keyBundle.epochStorageKeyPub.serialize()
        )

        if (!isValidEpochStorageKey) {
            return null
        }

        return pk_encrypt(
            deviceInEpoch.keyBundle.epochStorageKeyPub,
            thisDevice.keyBundle.public.epochStorageAuthKeyPub,
            thisDevice.keyBundle.private.epochStorageAuthKeyPriv,
            epochDistributionPreSharedKey,
            encode(`epoch_${newEpochWithoutID.sequenceID}`),
            newEpochEntropy
        )
    }

    const virtualDeviceEncryptedNewEpochEntropy = await encryptNewEpochEntropyForDeviceInEpoch(
        devicesInEpoch.virtualDevice
    )
    if (virtualDeviceEncryptedNewEpochEntropy === null) {
        throw new InvalidVirtualDeviceServerRepresentationError()
    }

    return {
        deviceIDToEncryptedNewEpochEntropyMap: Object.fromEntries(
            devicesInEpoch.devices.map(device =>
                [device.id, encryptNewEpochEntropyForDeviceInEpoch(device)]
            ).filter(device => device !== null)
        ),
        virtualDeviceEncryptedNewEpochEntropy
    }
}
