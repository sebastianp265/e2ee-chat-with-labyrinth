import {
    Epoch,
    EpochStorage,
    EpochStorageSerialized,
} from '@/lib/labyrinth/EpochStorage.ts';
import { joinAllEpochs } from '@/lib/labyrinth/phases/join-epoch.ts';
import {
    decrypt,
    encrypt,
} from '@/lib/labyrinth/crypto/authenticated-symmetric-encryption.ts';
import { kdf_one_key } from '@/lib/labyrinth/crypto/key-derivation.ts';
import {
    ThisDevice,
    ThisDeviceSerialized,
} from '@/lib/labyrinth/device/device.ts';
import { VirtualDevice } from '@/lib/labyrinth/device/virtual-device/VirtualDevice.ts';
import {
    asciiStringToBytes,
    base64StringToBytes,
    bytesToBase64String,
} from '@/lib/labyrinth/crypto/utils.ts';
import { openNewEpochBasedOnCurrent } from '@/lib/labyrinth/phases/open-new-epoch-based-on-current.ts';
import { LabyrinthServerClient } from './labyrinth-server-client';

export type LabyrinthSerialized = {
    thisDevice: ThisDeviceSerialized;
    epochStorage: EpochStorageSerialized;
};

export type CheckIfLabyrinthIsInitializedResponse = {
    isInitialized: boolean;
};

export type CheckIfLabyrinthIsInitializedServerClient = {
    checkIfLabyrinthIsInitialized: () => Promise<CheckIfLabyrinthIsInitializedResponse>;
};

export type NotifyAboutDeviceActivityServerClient = {
    notifyAboutDeviceActivity: (deviceId: string) => Promise<void>;
};

export type CheckIfAnyDeviceExceedInactivityLimitResponseDTO = {
    didAnyDeviceExceedInactivityLimit: boolean;
};

export type CheckIfAnyDeviceExceedInactivityLimitServerClient = {
    checkIfAnyDeviceExceedInactivityLimit: () => Promise<CheckIfAnyDeviceExceedInactivityLimitResponseDTO>;
};

const textEncoder = new TextEncoder();

const textDecoder = new TextDecoder();

export class Labyrinth {
    private readonly thisDevice: ThisDevice;
    private readonly epochStorage: EpochStorage;

    public static async checkIfLabyrinthIsInitialized(
        labyrinthServerClient: LabyrinthServerClient,
    ) {
        return await labyrinthServerClient.checkIfLabyrinthIsInitialized();
    }

    public static async initialize(
        userId: string,
        labyrinthServerClient: LabyrinthServerClient,
    ) {
        const { virtualDevice, virtualDeviceDecryptionKey, recoveryCode } =
            await VirtualDevice.initialize(userId);

        const { firstEpoch, thisDevice } = await ThisDevice.initialize(
            virtualDevice,
            virtualDeviceDecryptionKey,
            labyrinthServerClient,
        );

        const epochStorage = EpochStorage.createEmpty();
        epochStorage.add(firstEpoch);

        const labyrinthInstance = new Labyrinth(thisDevice, epochStorage);

        return {
            labyrinthInstance,
            recoveryCode,
        };
    }

    public static async fromRecoveryCode(
        userId: string,
        recoveryCode: string,
        labyrinthServerClient: LabyrinthServerClient,
    ): Promise<Labyrinth> {
        const { virtualDevice, epoch } = await VirtualDevice.fromRecoveryCode(
            userId,
            recoveryCode,
            labyrinthServerClient,
        );

        const epochStorage = EpochStorage.createEmpty();
        epochStorage.add(epoch);

        await joinAllEpochs(virtualDevice, epochStorage, labyrinthServerClient);

        const newestRecoveredEpoch = epochStorage.getNewestEpoch();
        const thisDevice = await ThisDevice.fromRecoveryCode(
            newestRecoveredEpoch,
            labyrinthServerClient,
        );

        await labyrinthServerClient.notifyAboutDeviceActivity(thisDevice.id);
        await checkIfAnyDeviceExceededInactivityLimitAndOpenNewEpochIfNeeded(
            labyrinthServerClient,
            thisDevice,
            epochStorage,
        );
        return new Labyrinth(thisDevice, epochStorage);
    }

    public static async deserialize(
        labyrinthSerialized: LabyrinthSerialized,
        labyrinthServerClient: LabyrinthServerClient,
    ): Promise<Labyrinth> {
        const {
            thisDevice: thisDeviceSerialized,
            epochStorage: epochStorageSerialized,
        } = labyrinthSerialized;
        const epochStorage = EpochStorage.deserialize(epochStorageSerialized);
        const thisDevice = await ThisDevice.deserialize(
            thisDeviceSerialized,
            epochStorage,
            labyrinthServerClient,
        );

        await labyrinthServerClient.notifyAboutDeviceActivity(thisDevice.id);
        await checkIfAnyDeviceExceededInactivityLimitAndOpenNewEpochIfNeeded(
            labyrinthServerClient,
            thisDevice,
            epochStorage,
        );
        return new Labyrinth(thisDevice, epochStorage);
    }

    public serialize(): LabyrinthSerialized {
        return {
            thisDevice: this.thisDevice.serialize(),
            epochStorage: this.epochStorage.serialize(),
        };
    }

    private constructor(thisDevice: ThisDevice, epochStorage: EpochStorage) {
        this.thisDevice = thisDevice;
        this.epochStorage = epochStorage;
    }

    public async encrypt(
        threadId: string,
        epochSequenceId: string,
        plaintext: string,
    ): Promise<string> {
        return bytesToBase64String(
            await encrypt(
                await deriveMessageKey(
                    threadId,
                    this.epochStorage.getEpoch(epochSequenceId),
                ),
                asciiStringToBytes(`message_thread_${threadId}`),
                textEncoder.encode(plaintext),
            ),
        );
    }

    public async decrypt(
        threadId: string,
        epochSequenceId: string,
        ciphertext: string,
    ): Promise<string> {
        return textDecoder.decode(
            await decrypt(
                await deriveMessageKey(
                    threadId,
                    this.epochStorage.getEpoch(epochSequenceId),
                ),
                asciiStringToBytes(`message_thread_${threadId}`),
                base64StringToBytes(ciphertext),
            ),
        );
    }

    public getNewestEpochSequenceId() {
        return this.epochStorage.getNewestEpoch().sequenceId;
    }

    public getNewestEpochId() {
        return this.epochStorage.getNewestEpoch().id;
    }
}

const CIPHER_VERSION = 1;

function deriveMessageKey(threadId: string, epoch: Epoch) {
    return kdf_one_key(
        epoch.rootKey,
        null,
        asciiStringToBytes(
            `message_key_in_epoch_${epoch.sequenceId}_cipher_version_${CIPHER_VERSION}_${threadId}`,
        ),
    );
}

async function checkIfAnyDeviceExceededInactivityLimitAndOpenNewEpochIfNeeded(
    labyrinthServerClient: LabyrinthServerClient,
    thisDevice: ThisDevice,
    epochStorage: EpochStorage,
) {
    const { didAnyDeviceExceedInactivityLimit } =
        await labyrinthServerClient.checkIfAnyDeviceExceedInactivityLimit();

    if (didAnyDeviceExceedInactivityLimit) {
        const newCreatedEpoch = await openNewEpochBasedOnCurrent(
            epochStorage.getNewestEpoch(),
            labyrinthServerClient,
            thisDevice,
        );
        epochStorage.add(newCreatedEpoch);
    }
}
