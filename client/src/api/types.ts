export type LoginRequestDTO = {
    username: string,
    password: string
}

export type LoginResponseDTO = {
    userId: number,
    inboxId: number
}

export type HelloGetDTO = {
    name: string,
    principal: string,
    details: string,
    credentials: string,
    authorities: string[],
    sessionId: string
}

export type ThreadPreviewGetDTO = {
    threadId: number,
    threadName: string,
    lastMessage: string,
    lastMessageAuthorName: string
}

export type UserIdToName = {
    [userId: number]: string
}

export type MessageGetDTO = {
    id: number,
    authorId: number,
    content: string
}