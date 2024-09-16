import {kdf_one_key, kdf_two_keys} from "@/lib/labyrinth/crypto/key-derivation.ts";
import {random} from "@/lib/labyrinth/crypto/utils.ts";
import {encrypt} from "@/lib/labyrinth/crypto/authenticated-symmetric-encryption.ts";
import {mac} from "@/lib/labyrinth/crypto/message-authentication.ts";
import {pk_verify} from "@/lib/labyrinth/crypto/signing.ts";
import {pk_encrypt} from "@/lib/labyrinth/crypto/public-key-encryption.ts";
import {
    DeviceIDToEncryptedEpochEntropyMap,
    Epoch,
    EpochRecoveryData,
    LabyrinthWebClient,
    PrivateDevice,
    PublicDevice
} from "@/lib/labyrinth/labyrinth-types.ts";


export async function createNewEpochBasedOnCurrent(currentEpoch: Epoch,
                                                   labyrinthWebClient: LabyrinthWebClient,
                                                   selfDevice: PrivateDevice): Promise<Epoch> {
    const foreignDevicesPromise = labyrinthWebClient.getDevicesInEpoch(currentEpoch.id)
    const [epochChainingKey, epochDistributionPreSharedKey] = kdf_two_keys(
        currentEpoch.rootKey,
        Buffer.alloc(0),
        Buffer.from(`epoch_chaining_${currentEpoch.sequenceID.toString()}_${currentEpoch.id}`)
    )

    const newEpochEntropy = random(32)
    const newEpochRootKey = kdf_one_key(
        newEpochEntropy,
        epochChainingKey,
        Buffer.from("epoch_root_key")
    )
    const newEpochSequenceID = (BigInt(currentEpoch.sequenceID) + 1n).toString()

    await encryptAndUploadEpochRecoveryData(
        currentEpoch,
        newEpochRootKey,
        newEpochSequenceID,
        labyrinthWebClient.uploadEpochRecoveryData
    )

    const currentEpochDeviceMacKey = createEpochDeviceMacKey(currentEpoch.rootKey, currentEpoch.sequenceID)

    const foreignDevices = await foreignDevicesPromise
    const newEpochID = await encryptAndUploadNewEpochEntropy(
        epochDistributionPreSharedKey,
        currentEpochDeviceMacKey,
        newEpochSequenceID,
        newEpochEntropy,
        selfDevice,
        foreignDevices,
        labyrinthWebClient.uploadEpochJoinData
    )

    await authenticateToEpoch(
        newEpochID,
        newEpochRootKey,
        newEpochSequenceID,
        selfDevice.keyBundle.public.deviceKeyPub.serialize(),
        labyrinthWebClient.uploadAuthenticationData
    )

    return {
        id: newEpochID,
        sequenceID: newEpochSequenceID,
        rootKey: newEpochRootKey
    }
}

async function encryptAndUploadEpochRecoveryData(currentEpoch: Epoch,
                                                 newEpochRootKey: Buffer,
                                                 newEpochSequenceID: string,
                                                 uploadEpochRecoveryData: (epochRecoveryData: EpochRecoveryData) => Promise<void>) {
    const newEpochDataStorageKey = kdf_one_key(
        newEpochRootKey,
        Buffer.alloc(0),
        Buffer.from(`epoch_data_storage_${Buffer.from(newEpochSequenceID).toString('base64')}`)
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

    return uploadEpochRecoveryData({
        encryptedEpochSequenceID: encryptedCurrentEpochSequenceID,
        encryptedEpochRootKey: encryptedCurrentEpochRootKey,
        epochID: currentEpoch.id
    })
}

function createEpochDeviceMacKey(epochRootKey: Buffer,
                                 epochSequenceID: string) {
    return kdf_one_key(
        epochRootKey,
        Buffer.alloc(0),
        Buffer.from(`epoch_devices_${Buffer.from(epochSequenceID).toString('base64')}`)
    )
}

export async function authenticateToEpoch(epochID: string,
                                          epochRootKey: Buffer,
                                          epochSequenceID: string,
                                          selfDeviceKeyPub: Buffer,
                                          uploadAuthenticationData: (epochID: string, epochDeviceMac: Buffer) => Promise<void>) {
    const epochDeviceMacKey = createEpochDeviceMacKey(epochRootKey, epochSequenceID)

    const epochDeviceMac = mac(epochDeviceMacKey, selfDeviceKeyPub)
    return uploadAuthenticationData(epochID, epochDeviceMac)
}

async function encryptAndUploadNewEpochEntropy(epochDistributionPreSharedKey: Buffer,
                                               currentEpochDeviceMacKey: Buffer,
                                               newEpochSequenceID: string,
                                               newEpochEntropy: Buffer,
                                               selfDeviceInEpoch: PrivateDevice,
                                               foreignDevicesInEpoch: PublicDevice[],
                                               uploadEpochJoinData: (
                                                   newEpochSequenceID: string,
                                                   deviceIDToEncryptedEpochEntropyMap: DeviceIDToEncryptedEpochEntropyMap
                                               ) => Promise<string>): Promise<string> {
    const deviceIDToNewEpochEntropy: { [deviceID: string]: Buffer } = {}

    for (const foreignDevice of foreignDevicesInEpoch) {
        const expectedCurrentEpochDeviceMac = mac(currentEpochDeviceMacKey, foreignDevice.keyBundle.deviceKeyPub.serialize())
        if (foreignDevice.mac !== expectedCurrentEpochDeviceMac) {
            continue
        }
        const isValidEpochStorageKey = pk_verify(
            foreignDevice.keyBundle.deviceKeyPub,
            foreignDevice.keyBundle.epochStorageKeySig,
            Buffer.of(0x30),
            foreignDevice.keyBundle.epochStorageKeyPub.serialize()
        )

        if (!isValidEpochStorageKey) {
            continue
        }

        deviceIDToNewEpochEntropy[foreignDevice.id] = pk_encrypt(
            foreignDevice.keyBundle.epochStorageKeyPub,
            selfDeviceInEpoch.keyBundle.public.epochStorageAuthKeyPub,
            selfDeviceInEpoch.keyBundle.private.epochStorageAuthKeyPriv,
            epochDistributionPreSharedKey,
            Buffer.from(`epoch_${newEpochSequenceID}`),
            newEpochEntropy
        )
    }

    return uploadEpochJoinData(newEpochSequenceID, deviceIDToNewEpochEntropy)
}

