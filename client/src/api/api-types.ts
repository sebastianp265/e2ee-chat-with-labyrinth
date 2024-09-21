import {PublicDevice} from "@/lib/labyrinth/labyrinth-types.ts";

export type LoginRequestDTO = {
    username: string,
    password: string
}

export type LoginResponseDTO = {
    userID: string,
}

export type HelloGetDTO = {
    name: string,
    principal: string,
    details: string,
    credentials: string,
    authorities: string[],
    sessionId: string
}

export type ThreadPreviewEncryptedGetDTO = {
    threadID: string,
    threadName: string,
    lastMessageEncryptedContent: Buffer,
    epochSequenceID: string
    lastMessageAuthorVisibleName: string
}

export type EncryptedMessageGetDTO = {
    id: string,
    epochSequenceID: string,
    authorID: string,
    encryptedContent: Buffer
}

export type SharedEntropyGetDTO = {
    newEpochID: string,
    senderDevice: PublicDevice
    encryptedEntropy: Buffer
}

export type EncryptedPrevEpochMetadataGetDTO = {
    id: string
    sequenceID: Buffer,
    rootKey: Buffer
}

export type UserIDToNameMap = {
    [key: string]: string
}
