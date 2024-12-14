import {useCallback, useEffect, useState} from "react";
import useWebSocket, {ReadyState} from "react-use-websocket";
import {z} from "zod";

const WebSocketChatMessageSchema = z.object({
    id: z.string(),
    authorId: z.string(),
    content: z.string(),
    timestamp: z.number(),
});

const ReceivedNewChatMessagePayloadSchema = z.object({
    threadId: z.string(),
    message: WebSocketChatMessageSchema,
});

const ReceivedNewThreadPayloadSchema = z.object({
    threadId: z.string(),
    threadName: z.nullable(z.string()),
    initialMessage: WebSocketChatMessageSchema,
    membersVisibleNameByUserId: z.record(z.string(), z.string()),
});

const ReceivedSocketMessageSchema = z.discriminatedUnion("type", [
    z.object({
        type: z.literal("NEW_CHAT_MESSAGE"),
        payload: ReceivedNewChatMessagePayloadSchema,
    }),
    z.object({
        type: z.literal("NEW_CHAT_THREAD"),
        payload: ReceivedNewThreadPayloadSchema,
    }),
]);

export type ReceivedNewChatMessagePayload = z.infer<typeof ReceivedNewChatMessagePayloadSchema>;
export type ReceivedNewChatThreadPayload = z.infer<typeof ReceivedNewThreadPayloadSchema>;

type SocketMessageToSend =
    | { type: "NEW_CHAT_MESSAGE", payload: NewChatMessageToSendPayload }
    | { type: "NEW_CHAT_THREAD", payload: NewChatThreadToSendPayload }

export type NewChatMessageToSendPayload = {
    threadId: string,
    content: string,
}

export type NewChatThreadToSendPayload = {
    initialMessageContent: string,
    otherMemberUserIds: string[],
}

export default function useChatWebSocket(
    shouldConnect: boolean,
    onNewChatMessageReceivedCallback: (receivedNewChatMessagePayload: ReceivedNewChatMessagePayload) => void,
    onNewChatThreadReceivedCallback: (receivedNewChatThreadPayload: ReceivedNewChatThreadPayload) => void,
) {
    const {sendMessage, lastJsonMessage, readyState} = useWebSocket('ws://localhost:8080/api/ws', {
        onOpen: () => console.log('WebSocket connection opened!'),
        onClose: () => console.log('WebSocket connection closed!'),
        onMessage: (event) => console.log('Received message:', event.data),
        onError: (event) => console.error('WebSocket error:', event),
        shouldReconnect: () => true,
    }, shouldConnect);
    const [error, setError] = useState<null | unknown>()

    useEffect(() => {
        if (lastJsonMessage === null) return

        const socketMessage = ReceivedSocketMessageSchema.parse(lastJsonMessage)
        switch (socketMessage.type) {
            case "NEW_CHAT_MESSAGE":
                onNewChatMessageReceivedCallback(socketMessage.payload)
                break
            case "NEW_CHAT_THREAD":
                onNewChatThreadReceivedCallback(socketMessage.payload)
                break
        }
    }, [lastJsonMessage, onNewChatMessageReceivedCallback, onNewChatThreadReceivedCallback]);

    const sendChatMessage = useCallback((message: NewChatMessageToSendPayload) => {
        if (readyState === ReadyState.OPEN) {
            const newChatMessage: SocketMessageToSend = {
                type: "NEW_CHAT_MESSAGE",
                payload: message,
            }

            sendMessage(JSON.stringify(newChatMessage))
        } else {
            // TODO: Proper error handling
            console.error(`Couldn't send message, ready state = ${readyState}`)
        }
    }, [readyState, sendMessage])

    const createChatThread = useCallback((thread: NewChatThreadToSendPayload) => {
        if (readyState === ReadyState.OPEN) {
            const newChatThread: SocketMessageToSend = {
                type: 'NEW_CHAT_THREAD',
                payload: thread,
            }

            sendMessage(JSON.stringify(newChatThread))
        } else {
            // TODO: Proper error handling
            console.error(`Couldn't send message, ready state = ${readyState}`)
        }
    }, [readyState, sendMessage])

    return {error, sendChatMessage, createChatThread}
}