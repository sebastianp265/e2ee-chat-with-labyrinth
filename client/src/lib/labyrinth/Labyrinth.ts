import {Epoch, EpochStorage, EpochStorageSerialized} from "@/lib/labyrinth/epoch/EpochStorage.ts";
import {joinAllEpochs} from "@/lib/labyrinth/epoch/join-epoch.ts";
import {decrypt, encrypt} from "@/lib/labyrinth/crypto/authenticated-symmetric-encryption.ts";
import {LabyrinthWebClient} from "@/lib/labyrinth/labyrinth-web-client.ts";
import {kdf_one_key} from "@/lib/labyrinth/crypto/key-derivation.ts";
import {generateEpochDeviceMac} from "@/lib/labyrinth/epoch/authenticate-device-to-epoch.ts";
import {ThisDevice, ThisDeviceSerialized} from "@/lib/labyrinth/device/device.ts";
import {BytesSerializer} from "@/lib/labyrinth/BytesSerializer.ts";
import {VirtualDevice} from "@/lib/labyrinth/device/virtual-device/VirtualDevice.ts";
import {asciiStringToBytes} from "@/lib/labyrinth/crypto/utils.ts";

export type LabyrinthSerialized = {
    inboxID: string,
    thisDevice: ThisDeviceSerialized,
    epochStorage: EpochStorageSerialized
}

export type CheckIfLabyrinthIsInitializedResponse = {
    isInitialized: boolean
}

export type CheckIfLabyrinthIsInitializedWebClient = {
    checkIfLabyrinthIsInitialized: () => Promise<CheckIfLabyrinthIsInitializedResponse>
}

const textEncoder = new TextEncoder()

const textDecoder = new TextDecoder()

export class Labyrinth {
    public readonly inboxID: string
    private readonly thisDevice: ThisDevice
    private readonly epochStorage: EpochStorage

    public static async checkIfLabyrinthIsInitialized(labyrinthWebClient: LabyrinthWebClient) {
        return await labyrinthWebClient.checkIfLabyrinthIsInitialized()
    }

    public static async fromFirstEpoch(userID: string, labyrinthWebClient: LabyrinthWebClient) {
        const {
            virtualDevice,
            virtualDeviceDecryptionKey,
            recoveryCode,
        } = await VirtualDevice.fromFirstEpoch(userID)

        const {
            firstEpoch,
            thisDevice,
            inboxID,
        } = await ThisDevice.fromFirstEpoch(virtualDevice, virtualDeviceDecryptionKey, labyrinthWebClient)

        const epochStorage = EpochStorage.createEmpty()
        epochStorage.add(firstEpoch)

        const labyrinthInstance = new Labyrinth(inboxID, thisDevice, epochStorage)

        return {
            labyrinthInstance,
            recoveryCode
        }
    }

    public static async fromRecoveryCode(userID: string, recoveryCode: string, labyrinthWebClient: LabyrinthWebClient): Promise<Labyrinth> {
        const {
            virtualDevice,
            epoch,
            inboxID,
        } = await VirtualDevice.fromRecoveryCode(userID, recoveryCode, labyrinthWebClient)

        const epochStorage = EpochStorage.createEmpty()
        epochStorage.add(epoch)

        await joinAllEpochs(virtualDevice.keyBundle, epochStorage, labyrinthWebClient)

        const thisDevice = await ThisDevice.fromRecoveryCode(labyrinthWebClient)

        const newestRecoveredEpoch = epochStorage.getNewestEpoch()
        await labyrinthWebClient.authenticateDeviceToEpoch(
            newestRecoveredEpoch.id,
            {
                epochDeviceMac: BytesSerializer.serialize(
                    await generateEpochDeviceMac(newestRecoveredEpoch, thisDevice.keyBundle.pub.deviceKeyPub)
                )
            }
        )

        return new Labyrinth(inboxID, thisDevice, epochStorage)
    }

    public static async deserialize(labyrinthSerialized: LabyrinthSerialized, labyrinthWebClient: LabyrinthWebClient): Promise<Labyrinth> {
        const {
            inboxID,
            thisDevice: thisDeviceSerialized,
            epochStorage: epochStorageSerialized,
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
                    epochDeviceMac: BytesSerializer.serialize(await generateEpochDeviceMac(
                        newestEpochAfter,
                        thisDevice.keyBundle.pub.deviceKeyPub
                    ))
                }
            )
        }

        return new Labyrinth(inboxID, thisDevice, epochStorage)
    }

    public serialize(): LabyrinthSerialized {
        return {
            inboxID: this.inboxID,
            thisDevice: this.thisDevice.serialize(),
            epochStorage: this.epochStorage.serialize()
        }
    }

    private constructor(
        inboxID: string,
        thisDevice: ThisDevice,
        epochStorage: EpochStorage,
    ) {
        this.inboxID = inboxID
        this.thisDevice = thisDevice
        this.epochStorage = epochStorage
    }

    public async encrypt(threadID: string, epochSequenceID: string, plaintext: string): Promise<Uint8Array> {
        return await encrypt(
            await this.getEncryptionKey(threadID, epochSequenceID),
            asciiStringToBytes(`message_thread_${threadID}`),
            textEncoder.encode(plaintext),
        )
    }

    public async decrypt(threadID: string, epochSequenceID: string, ciphertext: Uint8Array): Promise<string> {
        return textDecoder.decode(
            await decrypt(
                await this.getEncryptionKey(threadID, epochSequenceID),
                asciiStringToBytes(`message_thread_${threadID}`),
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
        null,
        asciiStringToBytes(`message_key_in_epoch_${epoch.sequenceID}_cipher_version_${CIPHER_VERSION}_${threadID}`)
    )
}