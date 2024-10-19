import {Epoch, EpochStorage} from "@/lib/labyrinth/epoch/EpochStorage.ts";
import {joinAllEpochs} from "@/lib/labyrinth/epoch/join-epoch.ts";
import {
    decryptVirtualDeviceRecoverSecrets,
    deriveVirtualDeviceIDAndDecryptionKey,
    generateRecoveryCode
} from "@/lib/labyrinth/device/virtual-device.ts";
import {decrypt, encrypt} from "@/lib/labyrinth/crypto/authenticated-symmetric-encryption.ts";
import {
    generateDeviceKeyBundle,
    generateVirtualDeviceKeyBundle,
    ThisDevice,
    VirtualDevice
} from "@/lib/labyrinth/device/device.ts";
import {openFirstEpoch} from "@/lib/labyrinth/epoch/open-new-epoch.ts";
import {LabyrinthWebClient} from "@/lib/labyrinth/labyrinth-web-client.ts";
import {kdf_one_key} from "@/lib/labyrinth/crypto/key-derivation.ts";

export type LabyrinthData = {
    device: ThisDevice;
    epochStorage: EpochStorage;
}

export type LabyrinthMessage = {
    threadID: string;
    epochSequenceID: string;
    plaintext: string;
}

export type LabyrinthMessageEncrypted = {
    threadID: string,
    epochSequenceID: string,
    ciphertext: Buffer
}

export class Labyrinth {
    private readonly labyrinthData: LabyrinthData

    public static async fromFirstInitialization(userID: string, labyrinthWebClient: LabyrinthWebClient): Promise<{
        labyrinthInstance: Labyrinth,
        recoveryCode: string
    }> {
        const deviceKeyBundle = generateDeviceKeyBundle()

        const recoveryCode = generateRecoveryCode()
        const {
            virtualDeviceID,
            virtualDeviceDecryptionKey
        } = deriveVirtualDeviceIDAndDecryptionKey(userID, recoveryCode)
        const virtualDevice: VirtualDevice = {
            id: virtualDeviceID,
            keyBundle: generateVirtualDeviceKeyBundle()
        }

        const {
            deviceID,
            firstEpoch
        } = await openFirstEpoch(
            deviceKeyBundle.public,
            virtualDeviceDecryptionKey,
            virtualDevice,
            labyrinthWebClient
        )

        const device: ThisDevice = {
            id: deviceID,
            keyBundle: deviceKeyBundle
        }

        const epochStorage = new EpochStorage()
        epochStorage.add(firstEpoch)

        const labyrinthData: LabyrinthData = {
            device,
            epochStorage
        }

        const labyrinthInstance = new Labyrinth(labyrinthData)

        return {
            labyrinthInstance,
            recoveryCode: recoveryCode
        }
    }

    public static async fromRecoveryCode(userID: string, recoveryCode: string, labyrinthWebClient: LabyrinthWebClient): Promise<Labyrinth> {
        const {
            virtualDeviceID,
            virtualDeviceDecryptionKey
        } = deriveVirtualDeviceIDAndDecryptionKey(userID, recoveryCode)

        const {
            epochID,
            virtualDeviceEncryptedRecoverySecrets
        } = labyrinthWebClient.getVirtualDeviceRecoverySecrets(virtualDeviceID)

        const {
            virtualDeviceKeyBundle,
            epochWithoutID
        } = decryptVirtualDeviceRecoverSecrets(
            virtualDeviceDecryptionKey,
            virtualDeviceEncryptedRecoverySecrets
        )

        const epochStorage = new EpochStorage()

        const epoch = {
            id: epochID,
            ...epochWithoutID
        }
        epochStorage.add(epoch)

        const virtualDevice = {
            id: virtualDeviceID,
            keyBundle: virtualDeviceKeyBundle
        } as VirtualDevice

        await joinAllEpochs(virtualDevice.keyBundle, epochStorage, labyrinthWebClient)

        const deviceKeyBundle = generateDeviceKeyBundle()

        const {deviceID} = await labyrinthWebClient.authenticateDeviceToEpoch(deviceKeyBundle.public)
        const device = {
            id: deviceID,
            keyBundle: deviceKeyBundle
        } as ThisDevice

        return new Labyrinth(
            {
                device,
                epochStorage
            }
        )
    }

    public static async fromJSONString(labyrinthDataJSONString: string, labyrinthWebClient: LabyrinthWebClient): Promise<Labyrinth> {
        const labyrinthData: LabyrinthData = JSON.parse(labyrinthDataJSONString)
        await joinAllEpochs(labyrinthData.device.keyBundle, labyrinthData.epochStorage, labyrinthWebClient)

        return new Labyrinth(labyrinthData)
    }

    //Labyrinth instance is created based on LabyrinthData stored on the device, if it is null then recoverLabyrinthData() or createFirstVirtualDevice() should be called before using
    private constructor(labyrinthData: LabyrinthData) {
        this.labyrinthData = structuredClone(labyrinthData)
    }

    public encrypt({threadID, epochSequenceID, plaintext}: LabyrinthMessage): Buffer {
        return encrypt(
            this.getEncryptionKey(threadID, epochSequenceID),
            Buffer.from(`message_thread_${threadID}`),
            Buffer.from(plaintext)
        )
    }

    public decrypt({threadID, epochSequenceID, ciphertext}: LabyrinthMessageEncrypted): string {
        return decrypt(
            this.getEncryptionKey(threadID, epochSequenceID),
            Buffer.from(`message_thread_${threadID}`),
            ciphertext
        ).toString()
    }

    private getEncryptionKey(threadID: string, epochSequenceID: string): Buffer {
        return deriveMessageKey(
            threadID,
            this.labyrinthData.epochStorage.getEpoch(epochSequenceID)
        )
    }

}

const CIPHER_VERSION = 1

function deriveMessageKey(threadID: string, epoch: Epoch) {
    return kdf_one_key(
        epoch.rootKey,
        Buffer.alloc(0),
        Buffer.from(`message_key_in_epoch_${epoch.sequenceID}_cipher_version_${CIPHER_VERSION}_${threadID}`)
    )
}