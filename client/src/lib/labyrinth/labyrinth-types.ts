import {PrivateKey, PublicKey} from "@signalapp/libsignal-client";

export type LabyrinthPublicKeyBundle = {
    deviceKeyPub: PublicKey

    epochStorageKeyPub: PublicKey
    epochStorageKeySig: Buffer

    epochStorageAuthKeyPub: PublicKey
    epochStorageAuthKeySig: Buffer
}

export type LabyrinthPrivateKeyBundle = {
    deviceKeyPriv: PrivateKey

    epochStorageKeyPriv: PrivateKey

    epochStorageAuthKeyPriv: PrivateKey
}

export type LabyrinthKeyBundle = {
    public: LabyrinthPublicKeyBundle
    private: LabyrinthPrivateKeyBundle
}

export type Epoch = {
    id: string,
    sequenceID: string,
    rootKey: Buffer,
}

export type PublicDevice = {
    id: string,
    mac: Buffer
    keyBundle: LabyrinthPublicKeyBundle
}

export type PrivateDevice = {
    id: string,
    keyBundle: LabyrinthKeyBundle
}

export type DeviceIDToEncryptedEpochEntropyMap = {
    [deviceID: string]: Buffer
}

export type EpochRecoveryData = {
    epochID: string,
    encryptedEpochSequenceID: Buffer,
    encryptedEpochRootKey: Buffer
}

export type EpochJoinData = {
    epochID: string,
    encryptedEpochEntropy: Buffer,
    senderDevice: PublicDevice
}

export type LabyrinthWebClient = {
    // upload encrypted new epoch entropy and return epochID assigned by server
    uploadEpochJoinData: (newEpochSequenceID: string, deviceIDToEncryptedEpochEntropyMap: DeviceIDToEncryptedEpochEntropyMap) => Promise<string>,

    uploadAuthenticationData: (epochID: string, epochDeviceMac: Buffer) => Promise<void>,
    uploadEpochRecoveryData: (epochRecoveryData: EpochRecoveryData) => Promise<void>,
    getDevicesInEpoch: (epochID: string) => Promise<PublicDevice[]>

    // joining newer epoch
    getEpochJoinData: (epochSequenceID: string) => Promise<EpochJoinData>,

    // joining older epoch
    getEpochRecoveryData: (epochSequenceID: string) => Promise<EpochRecoveryData>
}

