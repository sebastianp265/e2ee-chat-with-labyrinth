export type LoginRequestDTO = {
    username: string,
    password: string
}

export type HelloGetDTO = {
    name: string,
    principal: string,
    details: string,
    credentials: string,
    authorities: string[],
    sessionId: string
}

export type ConversationPreviewGetDTO = {
    conversationId: number,
    conversationName: string,
    lastMessage: string,
    lastMessageAuthorName: string
}

export type ConversationGetDTO = {
    messages: MessageGetDTO[],
    userIdToName: UserIdToName
}

type UserIdToName = {
    [userId: number]: string
}

type MessageGetDTO = {
    id: number,
    authorId: number,
    content: string
}