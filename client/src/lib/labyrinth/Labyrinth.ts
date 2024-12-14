import {Epoch, EpochStorage, EpochStorageSerialized} from "@/lib/labyrinth/epoch/EpochStorage.ts";
import {joinAllEpochs} from "@/lib/labyrinth/epoch/join-epoch.ts";
import {decrypt, encrypt} from "@/lib/labyrinth/crypto/authenticated-symmetric-encryption.ts";
import {LabyrinthWebClient} from "@/lib/labyrinth/labyrinth-web-client.ts";
import {kdf_one_key} from "@/lib/labyrinth/crypto/key-derivation.ts";
import {generateEpochDeviceMac} from "@/lib/labyrinth/epoch/authenticate-device-to-epoch.ts";
import {ThisDevice, ThisDeviceSerialized} from "@/lib/labyrinth/device/device.ts";
import {BytesSerializer} from "@/lib/labyrinth/BytesSerializer.ts";
import {VirtualDevice} from "@/lib/labyrinth/device/virtual-device/VirtualDevice.ts";
import {asciiStringToBytes, base64StringToBytes, bytesToBase64String} from "@/lib/labyrinth/crypto/utils.ts";

export type LabyrinthSerialized = {
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
    private readonly thisDevice: ThisDevice
    private readonly epochStorage: EpochStorage

    public static async checkIfLabyrinthIsInitialized(labyrinthWebClient: LabyrinthWebClient) {
        return await labyrinthWebClient.checkIfLabyrinthIsInitialized()
    }

    public static async fromFirstEpoch(userId: string, labyrinthWebClient: LabyrinthWebClient) {
        const {
            virtualDevice,
            virtualDeviceDecryptionKey,
            recoveryCode,
        } = await VirtualDevice.fromFirstEpoch(userId)

        const {
            firstEpoch,
            thisDevice,
        } = await ThisDevice.fromFirstEpoch(virtualDevice, virtualDeviceDecryptionKey, labyrinthWebClient)

        const epochStorage = EpochStorage.createEmpty()
        epochStorage.add(firstEpoch)

        const labyrinthInstance = new Labyrinth(thisDevice, epochStorage)

        return {
            labyrinthInstance,
            recoveryCode
        }
    }

    public static async fromRecoveryCode(userId: string, recoveryCode: string, labyrinthWebClient: LabyrinthWebClient): Promise<Labyrinth> {
        const {
            virtualDevice,
            epoch,
        } = await VirtualDevice.fromRecoveryCode(userId, recoveryCode, labyrinthWebClient)

        const epochStorage = EpochStorage.createEmpty()
        epochStorage.add(epoch)

        await joinAllEpochs(virtualDevice.keyBundle, epochStorage, labyrinthWebClient)

        const newestRecoveredEpoch = epochStorage.getNewestEpoch()
        const thisDevice = await ThisDevice.fromRecoveryCode(newestRecoveredEpoch, labyrinthWebClient)

        return new Labyrinth(thisDevice, epochStorage)
    }

    public static async deserialize(labyrinthSerialized: LabyrinthSerialized, labyrinthWebClient: LabyrinthWebClient): Promise<Labyrinth> {
        const {
            thisDevice: thisDeviceSerialized,
            epochStorage: epochStorageSerialized,
        } = labyrinthSerialized
        const thisDevice = ThisDevice.deserialize(thisDeviceSerialized)
        const epochStorage = EpochStorage.deserialize(epochStorageSerialized)

        const newestEpochBeforePotentiallyJoiningNewer = epochStorage.getNewestEpoch()
        await joinAllEpochs(thisDevice.keyBundle, epochStorage, labyrinthWebClient)
        const newestEpochAfter = epochStorage.getNewestEpoch()

        const hasJoinedNewerEpoch = newestEpochBeforePotentiallyJoiningNewer.sequenceId !== newestEpochAfter.sequenceId

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

        return new Labyrinth(thisDevice, epochStorage)
    }

    public serialize(): LabyrinthSerialized {
        return {
            thisDevice: this.thisDevice.serialize(),
            epochStorage: this.epochStorage.serialize()
        }
    }

    private constructor(
        thisDevice: ThisDevice,
        epochStorage: EpochStorage,
    ) {
        this.thisDevice = thisDevice
        this.epochStorage = epochStorage
    }

    public async encrypt(threadId: string, epochSequenceId: string, plaintext: string): Promise<string> {
        return bytesToBase64String(await encrypt(
            await this.getEncryptionKey(threadId, epochSequenceId),
            asciiStringToBytes(`message_thread_${threadId}`),
            textEncoder.encode(plaintext),
        ))
    }

    public async decrypt(threadId: string, epochSequenceId: string, ciphertext: string): Promise<string> {
        return textDecoder.decode(
            await decrypt(
                await this.getEncryptionKey(threadId, epochSequenceId),
                asciiStringToBytes(`message_thread_${threadId}`),
                base64StringToBytes(ciphertext),
            )
        )
    }

    private async getEncryptionKey(threadId: string, epochSequenceId: string): Promise<Uint8Array> {
        return await deriveMessageKey(
            threadId,
            this.epochStorage.getEpoch(epochSequenceId)
        )
    }

    public getNewestEpochSequenceId() {
        return this.epochStorage.getNewestEpoch().sequenceId
    }

    public getNewestEpochId() {
        return this.epochStorage.getNewestEpoch().id
    }
}

const CIPHER_VERSION = 1

function deriveMessageKey(threadId: string, epoch: Epoch) {
    return kdf_one_key(
        epoch.rootKey,
        null,
        asciiStringToBytes(`message_key_in_epoch_${epoch.sequenceId}_cipher_version_${CIPHER_VERSION}_${threadId}`)
    )
}