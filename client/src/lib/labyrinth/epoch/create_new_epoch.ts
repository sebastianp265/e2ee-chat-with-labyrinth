import {kdf_one_key, kdf_two_keys} from "@/lib/labyrinth/crypto/key_derivation.ts";
import {random} from "@/lib/labyrinth/crypto/utils.ts";
import {encrypt} from "@/lib/labyrinth/crypto/authenticated_symmetric_encryption.ts";
import {mac} from "@/lib/labyrinth/crypto/message_authentication.ts";
import {pk_verify} from "@/lib/labyrinth/crypto/signing.ts";
import {pk_encrypt} from "@/lib/labyrinth/crypto/public_key_encryption.ts";
import {
    DeviceIDToEncryptedEpochEntropyMap,
    Epoch,
    EpochRecoveryData,
    ForeignDevice,
    LabyrinthWebClient,
    SelfDevice
} from "@/lib/labyrinth/labyrinth-types.ts";


export function createNewEpochBasedOnCurrent(currentEpoch: Epoch,
                                             labyrinthWebClient: LabyrinthWebClient,
                                             selfDevice: SelfDevice): Epoch {
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

    encryptAndUploadEpochRecoveryData(
        currentEpoch,
        newEpochRootKey,
        newEpochSequenceID,
        labyrinthWebClient.uploadEpochRecoveryData
    )

    const currentEpochDeviceMacKey = createEpochDeviceMacKey(currentEpoch.rootKey, currentEpoch.sequenceID)

    const foreignDevices = labyrinthWebClient.getForeignDevicesInEpoch(currentEpoch.id)
    const newEpochID = encryptAndUploadNewEpochEntropy(
        epochDistributionPreSharedKey,
        currentEpochDeviceMacKey,
        newEpochSequenceID,
        newEpochEntropy,
        selfDevice,
        foreignDevices,
        labyrinthWebClient.uploadEncryptedNewEpochEntropy
    )

    authenticateToEpoch(
        newEpochID,
        newEpochRootKey,
        newEpochSequenceID,
        selfDevice.keyBundle.public.deviceKeyPub.serialize(),
        labyrinthWebClient.authenticateToEpoch
    )

    return {
        id: newEpochID,
        sequenceID: newEpochSequenceID,
        rootKey: newEpochRootKey
    }
}

export type EncryptedCurrentEpochSecrets = {
    epochSequenceID: Buffer,
    epochRootKey: Buffer
}

function encryptAndUploadEpochRecoveryData(currentEpoch: Epoch,
                                           newEpochRootKey: Buffer,
                                           newEpochSequenceID: string,
                                           uploadEpochRecoveryData: (epochID: string, epochRecoveryData: EpochRecoveryData) => void) {
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

    uploadEpochRecoveryData(currentEpoch.id,
        {
            encryptedEpochSequenceID: encryptedCurrentEpochSequenceID,
            encryptedEpochRootKey: encryptedCurrentEpochRootKey
        }
    )
}

export function createEpochDeviceMacKey(epochRootKey: Buffer,
                                        epochSequenceID: string) {
    return kdf_one_key(
        epochRootKey,
        Buffer.alloc(0),
        Buffer.from(`epoch_devices_${Buffer.from(epochSequenceID).toString('base64')}`)
    )
}

export function authenticateToEpoch(epochID: string,
                                    epochRootKey: Buffer,
                                    epochSequenceID: string,
                                    selfDeviceKeyPub: Buffer,
                                    uploadEpochDeviceMac: (epochID: string, epochDeviceMac: Buffer) => void) {
    const epochDeviceMacKey = createEpochDeviceMacKey(epochRootKey, epochSequenceID)

    const epochDeviceMac = mac(epochDeviceMacKey, selfDeviceKeyPub)
    uploadEpochDeviceMac(epochID, epochDeviceMac)
}

function encryptAndUploadNewEpochEntropy(epochDistributionPreSharedKey: Buffer,
                                         currentEpochDeviceMacKey: Buffer,
                                         newEpochSequenceID: string,
                                         newEpochEntropy: Buffer,
                                         selfDeviceInEpoch: SelfDevice,
                                         foreignDevicesInEpoch: ForeignDevice[],
                                         uploadEncryptedNewEpochEntropy:
                                             (
                                                 newEpochSequenceID: string,
                                                 deviceIDToEncryptedEpochEntropyMap: DeviceIDToEncryptedEpochEntropyMap
                                             ) => string): string {
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

    return uploadEncryptedNewEpochEntropy(newEpochSequenceID, deviceIDToNewEpochEntropy)
}

