import {Epoch, EpochStorage, EpochStorageSerialized} from "@/lib/labyrinth/epoch/EpochStorage.ts";
import {joinAllEpochs} from "@/lib/labyrinth/epoch/join-epoch.ts";
import {decrypt, encrypt} from "@/lib/labyrinth/crypto/authenticated-symmetric-encryption.ts";
import {LabyrinthWebClient} from "@/lib/labyrinth/labyrinth-web-client.ts";
import {kdf_one_key} from "@/lib/labyrinth/crypto/key-derivation.ts";
import {generateEpochDeviceMac} from "@/lib/labyrinth/epoch/authenticate-device-to-epoch.ts";
import {VirtualDevice} from "@/lib/labyrinth/device/virtual-device.ts";
import {ThisDevice, ThisDeviceSerialized} from "@/lib/labyrinth/device/device.ts";
import {decode, encode} from "@/lib/labyrinth/crypto/utils.ts";

export type LabyrinthSerialized = {
    thisDeviceSerialized: ThisDeviceSerialized,
    epochStorageSerialized: EpochStorageSerialized
}

export class Labyrinth {
    private readonly thisDevice: ThisDevice;
    private readonly epochStorage: EpochStorage;

    public static async fromFirstEpoch(userID: string, labyrinthWebClient: LabyrinthWebClient) {
        const {
            virtualDevice,
            virtualDeviceDecryptionKey,
            recoveryCode,
        } = await VirtualDevice.fromFirstEpoch(userID)

        const {
            firstEpoch,
            thisDevice
        } = await ThisDevice.fromFirstEpoch(virtualDevice, virtualDeviceDecryptionKey, labyrinthWebClient)

        const epochStorage = EpochStorage.createEmpty()
        epochStorage.add(firstEpoch)

        const labyrinthInstance = new Labyrinth(thisDevice, epochStorage)

        return {
            labyrinthInstance,
            recoveryCode
        }
    }

    public static async fromRecoveryCode(userID: string, recoveryCode: string, labyrinthWebClient: LabyrinthWebClient): Promise<Labyrinth> {
        const {
            virtualDevice,
            epoch
        } = await VirtualDevice.fromRecoveryCode(userID, recoveryCode, labyrinthWebClient)

        const epochStorage = EpochStorage.createEmpty()
        epochStorage.add(epoch)

        await joinAllEpochs(virtualDevice.keyBundle, epochStorage, labyrinthWebClient)

        const thisDevice = await ThisDevice.fromRecoveryCode(labyrinthWebClient)

        const newestRecoveredEpoch = epochStorage.getNewestEpoch()
        await labyrinthWebClient.authenticateDeviceToEpoch(
            newestRecoveredEpoch.id,
            {
                epochDeviceMac: await generateEpochDeviceMac(newestRecoveredEpoch, thisDevice.keyBundle.public.deviceKeyPub)
            }
        )

        return new Labyrinth(thisDevice, epochStorage)
    }

    public static async deserialize(labyrinthSerialized: LabyrinthSerialized, labyrinthWebClient: LabyrinthWebClient): Promise<Labyrinth> {
        const {
            thisDeviceSerialized,
            epochStorageSerialized
        } = labyrinthSerialized
        const thisDevice = ThisDevice.deserialize(thisDeviceSerialized)
        const epochStorage = EpochStorage.deserialize(epochStorageSerialized)

        const newestEpochBeforePotentiallyJoiningNewer = epochStorage.getNewestEpoch()
        await joinAllEpochs(thisDevice.keyBundle, epochStorage, labyrinthWebClient)
        const newestEpochAfter = epochStorage.getNewestEpoch()

        const hasJoinedNewerEpoch = newestEpochBeforePotentiallyJoiningNewer.sequenceID !== newestEpochAfter.sequenceID

        if (hasJoinedNewerEpoch) {
            await labyrinthWebClient.authenticateDeviceToEpoch(
                newestEpochAfter.id,
                {
                    epochDeviceMac: await generateEpochDeviceMac(
                        newestEpochAfter,
                        thisDevice.keyBundle.public.deviceKeyPub
                    )
                }
            )
        }

        return new Labyrinth(thisDevice, epochStorage)
    }

    public serialize(): LabyrinthSerialized {
        return {
            thisDeviceSerialized: this.thisDevice.serialize(),
            epochStorageSerialized: this.epochStorage.serialize()
        }
    }

    //Labyrinth instance is created based on LabyrinthData stored on the device, if it is null then recoverLabyrinthData() or createFirstVirtualDevice() should be called before using
    private constructor(thisDevice: ThisDevice, epochStorage: EpochStorage) {
        this.thisDevice = thisDevice
        this.epochStorage = epochStorage
    }

    public async encrypt(threadID: string, epochSequenceID: string, plaintext: string): Promise<Uint8Array> {
        return await encrypt(
            await this.getEncryptionKey(threadID, epochSequenceID),
            encode(`message_thread_${threadID}`),
            encode(plaintext),
        )
    }

    public async decrypt(threadID: string, epochSequenceID: string, ciphertext: Uint8Array): Promise<string> {
        return decode(
            await decrypt(
                await this.getEncryptionKey(threadID, epochSequenceID),
                encode(`message_thread_${threadID}`),
                ciphertext,
            )
        )
    }

    private async getEncryptionKey(threadID: string, epochSequenceID: string): Promise<Uint8Array> {
        return await deriveMessageKey(
            threadID,
            this.epochStorage.getEpoch(epochSequenceID)
        )
    }

    public getNewestEpochSequenceID() {
        return this.epochStorage.getNewestEpoch().sequenceID
    }

    public getNewestEpochID() {
        return this.epochStorage.getNewestEpoch().id
    }
}

const CIPHER_VERSION = 1

function deriveMessageKey(threadID: string, epoch: Epoch) {
    return kdf_one_key(
        epoch.rootKey,
        Uint8Array.of(),
        encode(`message_key_in_epoch_${epoch.sequenceID}_cipher_version_${CIPHER_VERSION}_${threadID}`)
    )
}