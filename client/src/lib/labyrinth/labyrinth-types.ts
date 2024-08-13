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

export type ForeignDevice = {
    id: string,
    mac: Buffer
    keyBundle: LabyrinthPublicKeyBundle
}

export type SelfDevice = {
    id: string,
    keyBundle: LabyrinthKeyBundle
}

export type DeviceIDToEncryptedEpochEntropyMap = {
    [deviceID: string]: Buffer
}

export type EpochRecoveryData = {
    encryptedEpochSequenceID: Buffer,
    encryptedEpochRootKey: Buffer
}

export type EpochIDAndEncryptedEntropy = {
    epochID: string,
    encryptedEpochEntropy: Buffer
}

export type LabyrinthWebClient = {
    // upload encrypted new epoch entropy and return epochID assigned by server
    uploadEncryptedNewEpochEntropy: (newEpochSequenceID: string, deviceIDToEncryptedEpochEntropyMap: DeviceIDToEncryptedEpochEntropyMap) => string,
    authenticateToEpoch: (epochID: string, epochDeviceMac: Buffer) => void,
    uploadEpochRecoveryData: (epochID: string, epochRecoveryData: EpochRecoveryData) => void,
    getForeignDevicesInEpoch: (epochID: string) => ForeignDevice[]

    // joining newer epoch
    getEncryptedEpochEntropy: (epochSequenceID: string) => EpochIDAndEncryptedEntropy,

    // joining older epoch
    getEpochRecoveryData: (epochSequenceID: string) => { epochID: string } & EpochRecoveryData
}

