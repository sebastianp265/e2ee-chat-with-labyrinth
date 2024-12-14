import {
    kdf_one_key,
    kdf_two_keys,
} from '@/lib/labyrinth/crypto/key-derivation.ts';
import { asciiStringToBytes, random } from '@/lib/labyrinth/crypto/utils.ts';
import { encrypt } from '@/lib/labyrinth/crypto/authenticated-symmetric-encryption.ts';
import { pk_encrypt } from '@/lib/labyrinth/crypto/public-key-encryption.ts';
import { generateEpochDeviceMac } from '@/lib/labyrinth/epoch/authenticate-device-to-epoch.ts';
import { Epoch, EpochWithoutId } from '@/lib/labyrinth/epoch/EpochStorage.ts';
import {
    DevicePublicKeyBundle,
    DevicePublicKeyBundleSerialized,
} from '@/lib/labyrinth/device/key-bundle/DeviceKeyBundle.ts';
import { VirtualDevice } from '@/lib/labyrinth/device/virtual-device/VirtualDevice.ts';
import {
    encryptVirtualDeviceRecoverySecrets,
    VirtualDeviceEncryptedRecoverySecretsSerialized,
} from '@/lib/labyrinth/device/virtual-device/VirtualDeviceEncryptedRecoverySecrets.ts';
import {
    VirtualDevicePublicKeyBundle,
    VirtualDevicePublicKeyBundleSerialized,
} from '@/lib/labyrinth/device/key-bundle/VirtualDeviceKeyBundle.ts';
import { ThisDevice } from '@/lib/labyrinth/device/device.ts';
import { BytesSerializer } from '@/lib/labyrinth/BytesSerializer.ts';
import { PublicKey } from '@/lib/labyrinth/crypto/keys.ts';
import {
    CommonPublicKeyBundle,
    CommonPublicKeyBundleSerialized,
} from '@/lib/labyrinth/device/key-bundle/DeviceAndVirtualDeviceCommonKeyBundle.ts';

export type OpenFirstEpochBody = {
    virtualDeviceId: string;
    virtualDeviceEncryptedRecoverySecrets: VirtualDeviceEncryptedRecoverySecretsSerialized;
    virtualDevicePublicKeyBundle: VirtualDevicePublicKeyBundleSerialized;
    devicePublicKeyBundle: DevicePublicKeyBundleSerialized;
    firstEpochMembershipProof: {
        epochDeviceMac: string;
        epochVirtualDeviceMac: string;
    };
};

export type OpenFirstEpochResponse = {
    deviceId: string;
    epochId: string;
};

export type OpenFirstEpochWebClient = {
    // returns assigned epoch id
    openFirstEpoch: (
        requestBody: OpenFirstEpochBody,
    ) => Promise<OpenFirstEpochResponse>;
};

export async function openFirstEpoch(
    devicePublicKeyBundle: DevicePublicKeyBundle,
    virtualDeviceDecryptionKey: Uint8Array,
    virtualDevice: VirtualDevice,
    webClient: OpenFirstEpochWebClient,
) {
    const firstEpochWithoutId: EpochWithoutId = {
        sequenceId: '0',
        rootKey: random(32),
    };

    const epochVirtualDeviceMac = await generateEpochDeviceMac(
        firstEpochWithoutId,
        virtualDevice.keyBundle.pub.deviceKeyPub,
    );

    const epochThisDeviceMac = await generateEpochDeviceMac(
        firstEpochWithoutId,
        devicePublicKeyBundle.deviceKeyPub,
    );

    const virtualDeviceEncryptedRecoverySecrets =
        await encryptVirtualDeviceRecoverySecrets(
            virtualDeviceDecryptionKey,
            firstEpochWithoutId,
            virtualDevice.keyBundle.priv,
        );

    const openFirstEpochResponse = await webClient.openFirstEpoch({
        virtualDeviceId: BytesSerializer.serialize(virtualDevice.id),
        firstEpochMembershipProof: {
            epochDeviceMac: BytesSerializer.serialize(epochThisDeviceMac),
            epochVirtualDeviceMac: BytesSerializer.serialize(
                epochVirtualDeviceMac,
            ),
        },
        devicePublicKeyBundle: devicePublicKeyBundle.serialize(),
        virtualDevicePublicKeyBundle: virtualDevice.keyBundle.pub.serialize(),
        virtualDeviceEncryptedRecoverySecrets:
            virtualDeviceEncryptedRecoverySecrets.serialize(),
    });

    const firstEpoch = {
        id: openFirstEpochResponse.epochId,
        ...firstEpochWithoutId,
    } as Epoch;

    return {
        deviceId: openFirstEpochResponse.deviceId,
        firstEpoch,
    };
}

type DeviceInEpochSerialized = {
    id: string;
} & VirtualDeviceInEpochSerialized;

type VirtualDeviceInEpochSerialized = {
    mac: string;
    publicKeyBundle: CommonPublicKeyBundleSerialized;
};

type DeviceInEpoch = {
    id: string;
} & VirtualDeviceInEpoch;

type VirtualDeviceInEpoch = {
    mac: Uint8Array;
    publicKeyBundle: VirtualDevicePublicKeyBundle;
};

export type GetDevicesInEpochResponse = {
    devices: DeviceInEpochSerialized[];
    virtualDevice: VirtualDeviceInEpochSerialized;
};

type EncryptedNewEpochEntropyForEveryDeviceInEpochSerialized = {
    deviceIdToEncryptedNewEpochEntropyMap: {
        [deviceId: string]: string;
    };
    virtualDeviceEncryptedNewEpochEntropy: string;
};

type EncryptedNewEpochEntropyForEveryDeviceInEpoch = {
    deviceIdToEncryptedNewEpochEntropyMap: {
        [deviceId: string]: Uint8Array;
    };
    virtualDeviceEncryptedNewEpochEntropy: Uint8Array;
};

type EncryptedCurrentEpochJoinData = {
    encryptedEpochSequenceId: string;
    encryptedEpochRootKey: string;
};

export type OpenNewEpochBasedOnCurrentBody = {
    encryptedNewEpochEntropyForEveryDeviceInEpoch: EncryptedNewEpochEntropyForEveryDeviceInEpochSerialized;
    newEpochMembershipProof: {
        epochThisDeviceMac: string;
        epochVirtualDeviceMac: string;
    };
    encryptedCurrentEpochJoinData: EncryptedCurrentEpochJoinData;
};

export type OpenNewEpochBasedOnCurrentResponse = {
    openedEpochId: string;
};

export type OpenNewEpochBasedOnCurrentWebClient = {
    getDevicesInEpoch: (epochId: string) => Promise<GetDevicesInEpochResponse>;
    openNewEpochBasedOnCurrent: (
        currentEpochId: string,
        requestBody: OpenNewEpochBasedOnCurrentBody,
    ) => Promise<OpenNewEpochBasedOnCurrentResponse>;
};

export async function openNewEpochBasedOnCurrent(
    currentEpoch: Epoch,
    webClient: OpenNewEpochBasedOnCurrentWebClient,
    thisDevice: ThisDevice,
): Promise<Epoch> {
    const devicesInEpochPromise = webClient.getDevicesInEpoch(currentEpoch.id);
    const [epochChainingKey, epochDistributionPreSharedKey] =
        await kdf_two_keys(
            currentEpoch.rootKey,
            null,
            asciiStringToBytes(
                `epoch_chaining_${currentEpoch.sequenceId}_${currentEpoch.id}`,
            ),
        );

    const newEpochEntropy = random(32);
    const newEpochWithoutId: EpochWithoutId = {
        rootKey: await kdf_one_key(
            newEpochEntropy,
            epochChainingKey,
            asciiStringToBytes('epoch_root_key'),
        ),
        sequenceId: (BigInt(currentEpoch.sequenceId) + 1n).toString(),
    };

    const devicesInEpoch = await devicesInEpochPromise;

    const encryptedNewEpochEntropyForEveryDeviceInEpoch =
        await encryptNewEpochEntropyForEveryDeviceInEpoch(
            currentEpoch,
            newEpochWithoutId,
            thisDevice,
            devicesInEpoch.devices.map((v) => {
                return {
                    id: v.id,
                    mac: BytesSerializer.deserialize(v.mac),
                    publicKeyBundle: CommonPublicKeyBundle.deserialize(
                        v.publicKeyBundle,
                    ),
                } as DeviceInEpoch;
            }),
            {
                mac: BytesSerializer.deserialize(
                    devicesInEpoch.virtualDevice.mac,
                ),
                publicKeyBundle: CommonPublicKeyBundle.deserialize(
                    devicesInEpoch.virtualDevice.publicKeyBundle,
                ),
            } as VirtualDeviceInEpoch,
            epochDistributionPreSharedKey,
            newEpochEntropy,
        );

    const { openedEpochId } = await webClient.openNewEpochBasedOnCurrent(
        currentEpoch.id,
        {
            encryptedNewEpochEntropyForEveryDeviceInEpoch: {
                deviceIdToEncryptedNewEpochEntropyMap: Object.fromEntries(
                    Object.entries(
                        encryptedNewEpochEntropyForEveryDeviceInEpoch.deviceIdToEncryptedNewEpochEntropyMap,
                    ).map((e) => {
                        const [k, v] = e;
                        return [k, BytesSerializer.serialize(v)];
                    }),
                ),
                virtualDeviceEncryptedNewEpochEntropy:
                    BytesSerializer.serialize(
                        encryptedNewEpochEntropyForEveryDeviceInEpoch.virtualDeviceEncryptedNewEpochEntropy,
                    ),
            },
            newEpochMembershipProof: {
                epochThisDeviceMac: BytesSerializer.serialize(
                    await generateEpochDeviceMac(
                        newEpochWithoutId,
                        thisDevice.keyBundle.pub.deviceKeyPub,
                    ),
                ),
                epochVirtualDeviceMac: BytesSerializer.serialize(
                    await generateEpochDeviceMac(
                        newEpochWithoutId,
                        PublicKey.deserialize(
                            devicesInEpoch.virtualDevice.publicKeyBundle
                                .deviceKeyPub,
                        ),
                    ),
                ),
            },
            encryptedCurrentEpochJoinData: await encryptCurrentEpochJoinData(
                currentEpoch,
                newEpochWithoutId,
            ),
        },
    );

    return {
        id: openedEpochId,
        sequenceId: newEpochWithoutId.sequenceId,
        rootKey: newEpochWithoutId.rootKey,
    };
}

async function encryptCurrentEpochJoinData(
    currentEpoch: Epoch,
    newEpochWithoutId: EpochWithoutId,
): Promise<EncryptedCurrentEpochJoinData> {
    const newEpochDataStorageKey = await kdf_one_key(
        newEpochWithoutId.rootKey,
        null,
        asciiStringToBytes(
            `epoch_data_storage_${newEpochWithoutId.sequenceId}`,
        ),
    );

    const encryptedCurrentEpochSequenceId = await encrypt(
        newEpochDataStorageKey,
        asciiStringToBytes('epoch_data_metadata'),
        asciiStringToBytes(currentEpoch.sequenceId),
    );

    const encryptedCurrentEpochRootKey = await encrypt(
        newEpochDataStorageKey,
        asciiStringToBytes('epoch_data_metadata'),
        currentEpoch.rootKey,
    );

    return {
        encryptedEpochSequenceId: BytesSerializer.serialize(
            encryptedCurrentEpochSequenceId,
        ),
        encryptedEpochRootKey: BytesSerializer.serialize(
            encryptedCurrentEpochRootKey,
        ),
    };
}

export class InvalidVirtualDeviceServerRepresentationError extends Error {
    constructor() {
        super(
            "Epoch can't be opened when virtual device server representation is invalid",
        );

        Object.setPrototypeOf(
            this,
            InvalidVirtualDeviceServerRepresentationError.prototype,
        );
    }
}

async function encryptNewEpochEntropyForEveryDeviceInEpoch(
    currentEpoch: Epoch,
    newEpochWithoutId: EpochWithoutId,
    thisDevice: ThisDevice,
    devicesInEpoch: DeviceInEpoch[],
    virtualDeviceInEpoch: VirtualDeviceInEpoch,
    epochDistributionPreSharedKey: Uint8Array,
    newEpochEntropy: Uint8Array,
): Promise<EncryptedNewEpochEntropyForEveryDeviceInEpoch> {
    async function encryptNewEpochEntropyForDeviceInEpoch(
        deviceInEpoch: VirtualDeviceInEpoch | DeviceInEpoch,
    ) {
        const expectedEpochDeviceMac = await generateEpochDeviceMac(
            currentEpoch,
            deviceInEpoch.publicKeyBundle.deviceKeyPub,
        );
        if (deviceInEpoch.mac !== expectedEpochDeviceMac) {
            return null;
        }

        const isValidEpochStorageKey =
            deviceInEpoch.publicKeyBundle.deviceKeyPub.verify(
                deviceInEpoch.publicKeyBundle.epochStorageKeySig,
                Uint8Array.of(0x30),
                deviceInEpoch.publicKeyBundle.epochStorageKeyPub.getX25519PublicKeyBytes(),
            );

        if (!isValidEpochStorageKey) {
            return null;
        }

        return pk_encrypt(
            deviceInEpoch.publicKeyBundle.epochStorageKeyPub,
            thisDevice.keyBundle.pub.epochStorageAuthKeyPub,
            thisDevice.keyBundle.priv.epochStorageAuthKeyPriv,
            epochDistributionPreSharedKey,
            asciiStringToBytes(`epoch_${newEpochWithoutId.sequenceId}`),
            newEpochEntropy,
        );
    }

    const virtualDeviceEncryptedNewEpochEntropy =
        await encryptNewEpochEntropyForDeviceInEpoch(virtualDeviceInEpoch);
    if (virtualDeviceEncryptedNewEpochEntropy === null) {
        throw new InvalidVirtualDeviceServerRepresentationError();
    }

    return {
        deviceIdToEncryptedNewEpochEntropyMap: Object.fromEntries(
            devicesInEpoch
                .map((device) => [
                    device.id,
                    encryptNewEpochEntropyForDeviceInEpoch(device),
                ])
                .filter((device) => device !== null),
        ),
        virtualDeviceEncryptedNewEpochEntropy,
    };
}
