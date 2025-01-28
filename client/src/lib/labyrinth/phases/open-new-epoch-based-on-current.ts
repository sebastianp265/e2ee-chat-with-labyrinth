import {
    CommonPublicKeyBundle,
    CommonPublicKeyBundleSerialized,
} from '@/lib/labyrinth/device/key-bundle/DeviceAndVirtualDeviceCommonKeyBundle.ts';
import { VirtualDevicePublicKeyBundle } from '@/lib/labyrinth/device/key-bundle/VirtualDeviceKeyBundle.ts';
import { Epoch, EpochWithoutId } from '@/lib/labyrinth/EpochStorage.ts';
import { ThisDevice } from '@/lib/labyrinth/device/device.ts';
import {
    kdf_one_key,
    kdf_two_keys,
} from '@/lib/labyrinth/crypto/key-derivation.ts';
import {
    asciiStringToBytes,
    bytes_equal,
    random,
} from '@/lib/labyrinth/crypto/utils.ts';
import { BytesSerializer } from '@/lib/labyrinth/BytesSerializer.ts';
import { generateEpochDeviceMac } from '@/lib/labyrinth/phases/authenticate-device-to-epoch.ts';
import { PublicKey } from '@/lib/labyrinth/crypto/keys.ts';
import { encrypt } from '@/lib/labyrinth/crypto/authenticated-symmetric-encryption.ts';
import { labyrinth_hpke_encrypt } from '@/lib/labyrinth/crypto/public-key-encryption.ts';

type DeviceInEpochSerialized = {
    id: string;
} & VirtualDeviceInEpochSerialized;

type VirtualDeviceInEpochSerialized = {
    mac: string;
    keyBundle: CommonPublicKeyBundleSerialized;
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
    // encryptedCurrentEpochJoinData: EncryptedCurrentEpochJoinData;
};

export type OpenNewEpochBasedOnCurrentResponse = {
    openedEpochId: string;
};

export type OpenNewEpochBasedOnCurrentServerClient = {
    getDevicesInEpoch: (epochId: string) => Promise<GetDevicesInEpochResponse>;
    openNewEpochBasedOnCurrent: (
        currentEpochId: string,
        thisDeviceId: string,
        requestBody: OpenNewEpochBasedOnCurrentBody,
    ) => Promise<OpenNewEpochBasedOnCurrentResponse>;
};

export async function openNewEpochBasedOnCurrent(
    currentEpoch: Epoch,
    webClient: OpenNewEpochBasedOnCurrentServerClient,
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
                        v.keyBundle,
                    ),
                } as DeviceInEpoch;
            }),
            {
                mac: BytesSerializer.deserialize(
                    devicesInEpoch.virtualDevice.mac,
                ),
                publicKeyBundle: CommonPublicKeyBundle.deserialize(
                    devicesInEpoch.virtualDevice.keyBundle,
                ),
            } as VirtualDeviceInEpoch,
            epochDistributionPreSharedKey,
            newEpochEntropy,
        );

    const { openedEpochId } = await webClient.openNewEpochBasedOnCurrent(
        currentEpoch.id,
        thisDevice.id,
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
                            devicesInEpoch.virtualDevice.keyBundle.deviceKeyPub,
                        ),
                    ),
                ),
            },
        },
    );

    return {
        id: openedEpochId,
        sequenceId: newEpochWithoutId.sequenceId,
        rootKey: newEpochWithoutId.rootKey,
    };
}

// @ts-ignore
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

        if (!bytes_equal(deviceInEpoch.mac, expectedEpochDeviceMac)) {
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

        return labyrinth_hpke_encrypt(
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

    const deviceIdToEncryptedNewEpochEntropyMap = Object.fromEntries(
        (
            await Promise.all(
                devicesInEpoch.map(
                    async (device) =>
                        [
                            device.id,
                            await encryptNewEpochEntropyForDeviceInEpoch(
                                device,
                            ),
                        ] as const,
                ),
            )
        ).filter((e): e is [string, Uint8Array] => e[1] !== null),
    );

    return {
        deviceIdToEncryptedNewEpochEntropyMap,
        virtualDeviceEncryptedNewEpochEntropy,
    };
}
