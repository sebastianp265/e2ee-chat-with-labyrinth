import {LabyrinthPublicKeyBundle} from "@/lib/labyrinth/labyrinth.ts";
import {ForeignDevice} from "@/lib/labyrinth/epoch.ts";

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
    metadata: {
        epoch: {
            id: string,
            sequenceID: bigint
        }
        authorPublicKeyBundle: LabyrinthPublicKeyBundle
    }
    lastMessageAuthorVisibleName: string
}

export type UserIdToNameMap = {
    [userID: number]: string
}

export type EncryptedMessageGetDTO = {
    id: string,
    authorID: string,
    encryptedContent: Buffer
}

export type SharedEntropyGetDTO = {
    newEpochID: string,
    senderDevice: ForeignDevice
    encryptedEntropy: Buffer
}

export type EncryptedPrevEpochMetadataGetDTO = {
    id: string
    sequenceID: Buffer,
    rootKey: Buffer
}

