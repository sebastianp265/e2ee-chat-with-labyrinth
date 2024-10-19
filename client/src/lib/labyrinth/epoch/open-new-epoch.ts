import {kdf_one_key, kdf_two_keys} from "@/lib/labyrinth/crypto/key-derivation.ts";
import {random} from "@/lib/labyrinth/crypto/utils.ts";
import {encrypt} from "@/lib/labyrinth/crypto/authenticated-symmetric-encryption.ts";
import {pk_verify} from "@/lib/labyrinth/crypto/signing.ts";
import {pk_encrypt} from "@/lib/labyrinth/crypto/public-key-encryption.ts";
import {
    encryptVirtualDeviceRecoverSecrets,
    VirtualDeviceEncryptedRecoverSecrets
} from "@/lib/labyrinth/device/virtual-device.ts";
import {
    DevicePublicKeyBundle,
    DevicePublicKeyBundleWithoutEpochStorageAuthKeyPair,
    ThisDevice,
    VirtualDevice,
} from "@/lib/labyrinth/device/device.ts";
import {generateEpochDeviceMac} from "@/lib/labyrinth/epoch/authenticate-to-epoch.ts";
import {Epoch, EpochWithoutID} from "@/lib/labyrinth/epoch/EpochStorage.ts";

export type OpenFirstEpochBody = {
    virtualDeviceEncryptedRecoverySecrets: VirtualDeviceEncryptedRecoverSecrets,
    firstEpochMembershipProof: {
        epochThisDeviceMac: Buffer,
        epochVirtualDeviceMac: Buffer
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

// TODO: DONE
export async function openFirstEpoch(devicePublicKeyBundle: DevicePublicKeyBundle,
                                     virtualDeviceDecryptionKey: Buffer,
                                     virtualDevice: VirtualDevice,
                                     webClient: OpenFirstEpochWebClient) {
    const firstEpochWithoutID: EpochWithoutID = {
        sequenceID: "0",
        rootKey: random(32)
    }

    const epochVirtualDeviceMac = generateEpochDeviceMac(
        firstEpochWithoutID,
        virtualDevice.keyBundle.public.deviceKeyPub.getPublicKeyBytes()
    )

    const epochThisDeviceMac = generateEpochDeviceMac(
        firstEpochWithoutID,
        devicePublicKeyBundle.deviceKeyPub.getPublicKeyBytes()
    )

    const virtualDeviceEncryptedRecoverySecrets = encryptVirtualDeviceRecoverSecrets(
        virtualDeviceDecryptionKey,
        firstEpochWithoutID,
        virtualDevice.keyBundle
    )

    const openFirstEpochResponse = await webClient.openFirstEpoch({
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
    mac: Buffer,
    keyBundle: DevicePublicKeyBundleWithoutEpochStorageAuthKeyPair
}

export type GetDevicesInEpochResponse = {
    devices: DeviceInEpoch[]
    virtualDevice: VirtualDeviceInEpoch
}


type EncryptedNewEpochEntropyForEveryDeviceInEpoch = {
    deviceIDToEncryptedNewEpochEntropyMap: {
        [deviceID: string]: Buffer,
    },
    virtualDeviceEncryptedNewEpochEntropy: Buffer,
}

type EncryptedCurrentEpochJoinData = {
    encryptedEpochSequenceID: Buffer,
    encryptedEpochRootKey: Buffer,
}

export type OpenNewEpochBasedOnCurrentBody = {
    encryptedNewEpochEntropyForEveryDeviceInEpoch: EncryptedNewEpochEntropyForEveryDeviceInEpoch
    newEpochMembershipProof: {
        epochThisDeviceMac: Buffer,
        epochVirtualDeviceMac: Buffer
    },
    encryptedCurrentEpochJoinData: EncryptedCurrentEpochJoinData
}

export type OpenNewEpochBasedOnCurrentWebClient = {
    getDevicesInEpoch: (epochID: string) => Promise<GetDevicesInEpochResponse>
    openNewEpochBasedOnCurrent: (currentEpochID: string, requestBody: OpenNewEpochBasedOnCurrentBody) => Promise<string>
}

// TODO: DONE
export async function openNewEpochBasedOnCurrent(currentEpoch: Epoch,
                                                 webClient: OpenNewEpochBasedOnCurrentWebClient,
                                                 thisDevice: ThisDevice): Promise<Epoch> {
    const devicesInEpochPromise = webClient.getDevicesInEpoch(currentEpoch.id)
    const [epochChainingKey, epochDistributionPreSharedKey] = kdf_two_keys(
        currentEpoch.rootKey,
        Buffer.alloc(0),
        Buffer.from(`epoch_chaining_${currentEpoch.sequenceID.toString()}_${currentEpoch.id}`)
    )

    const newEpochEntropy = random(32)
    const newEpochWithoutID: EpochWithoutID = {
        rootKey: kdf_one_key(
            newEpochEntropy,
            epochChainingKey,
            Buffer.from("epoch_root_key")
        ),
        sequenceID: (BigInt(currentEpoch.sequenceID) + 1n).toString()
    }

    const devicesInEpoch = await devicesInEpochPromise

    return {
        id: await webClient.openNewEpochBasedOnCurrent(currentEpoch.id, {
                encryptedNewEpochEntropyForEveryDeviceInEpoch: encryptNewEpochEntropyForEveryDeviceInEpoch(
                    currentEpoch,
                    newEpochWithoutID,
                    thisDevice,
                    devicesInEpoch,
                    epochDistributionPreSharedKey,
                    newEpochEntropy
                ),
                newEpochMembershipProof: {
                    epochThisDeviceMac: generateEpochDeviceMac(
                        newEpochWithoutID,
                        thisDevice.keyBundle.public.deviceKeyPub.getPublicKeyBytes()
                    ),
                    epochVirtualDeviceMac: generateEpochDeviceMac(
                        newEpochWithoutID,
                        devicesInEpoch.virtualDevice.keyBundle.deviceKeyPub.getPublicKeyBytes()
                    )
                },
                encryptedCurrentEpochJoinData: encryptCurrentEpochJoinData(
                    currentEpoch,
                    newEpochWithoutID
                ),
            }
        ),
        sequenceID: newEpochWithoutID.sequenceID,
        rootKey: newEpochWithoutID.rootKey
    }
}

function encryptCurrentEpochJoinData(currentEpoch: Epoch,
                                     newEpochWithoutID: EpochWithoutID): EncryptedCurrentEpochJoinData {
    const newEpochDataStorageKey = kdf_one_key(
        newEpochWithoutID.rootKey,
        Buffer.alloc(0),
        Buffer.from(`epoch_data_storage_${Buffer.from(newEpochWithoutID.sequenceID).toString('base64')}`)
    )

    const encryptedCurrentEpochSequenceID = encrypt(
        newEpochDataStorageKey,
        Buffer.from("epoch_data_metadata"),
        Buffer.from(currentEpoch.sequenceID)
    )

    const encryptedCurrentEpochRootKey = encrypt(
        newEpochDataStorageKey,
        Buffer.from("epoch_data_metadata"),
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

function encryptNewEpochEntropyForEveryDeviceInEpoch(currentEpoch: Epoch,
                                                     newEpochWithoutID: EpochWithoutID,
                                                     thisDevice: ThisDevice,
                                                     devicesInEpoch: GetDevicesInEpochResponse,
                                                     epochDistributionPreSharedKey: Buffer,
                                                     newEpochEntropy: Buffer): EncryptedNewEpochEntropyForEveryDeviceInEpoch {

    function encryptNewEpochEntropyForDeviceInEpoch(deviceInEpoch: VirtualDeviceInEpoch | DeviceInEpoch) {
        const expectedEpochDeviceMac = generateEpochDeviceMac(
            currentEpoch,
            deviceInEpoch.keyBundle.deviceKeyPub.getPublicKeyBytes()
        )
        if (deviceInEpoch.mac !== expectedEpochDeviceMac) {
            return null
        }

        const isValidEpochStorageKey = pk_verify(
            deviceInEpoch.keyBundle.deviceKeyPub,
            deviceInEpoch.keyBundle.epochStorageKeySig,
            Buffer.of(0x30),
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
            Buffer.from(`epoch_${newEpochWithoutID.sequenceID}`),
            newEpochEntropy
        )
    }

    const virtualDeviceEncryptedNewEpochEntropy = encryptNewEpochEntropyForDeviceInEpoch(
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
