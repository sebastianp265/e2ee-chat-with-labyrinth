import {AddMessagesActionPayload, AddThreadsActionPayload} from "@/pages/messages/hooks/useThreadsData.ts";

// Receiving

export type ReceivedSocketMessage =
    | ReceivedChat
    | Notification

type ReceivedChat =
    | { type: 'NEW_MESSAGES', payload: AddMessagesActionPayload }
    | { type: 'NEW_THREADS', payload: AddThreadsActionPayload }

type Notification =
    | { type: 'NEW_FRIEND', payload: ReceivedNewFriend }
    | { type: 'NEW_FRIEND_REQUEST', payload: ReceivedNewFriendRequest }

export type ReceivedNewFriend = {
    userID: string,
    visibleName: string,
}

export type ReceivedNewFriendRequest = {
    fromUserID: string,
    visibleName: string,
}

// Sending

export type SocketMessageToSend =
    | ChatToSend

type ChatToSend =
    | { type: 'NEW_MESSAGE', payload: NewMessageToSend }
    | { type: 'NEW_THREAD', payload: NewThreadToSend }

export type NewMessageToSend = {
    threadID: string,
    content: string,
}

export type NewThreadToSend = {
    messageContent: string,
    memberUserIDs: string[],
}