import {useEffect, useState} from "react";
import axiosInstance from "@/api/axios/axiosInstance.ts";
import useWebSocket, {ReadyState} from "react-use-websocket";
import {Labyrinth} from "@/lib/labyrinth/Labyrinth.ts";
import {NewMessageToSend, NewThreadToSend, ReceivedSocketMessage, SocketMessageToSend} from "@/api/socket-types.ts";
import {
    AddMessagesActionPayload,
    AddThreadsActionPayload,
    LabyrinthEncryptedMessageGetDTO
} from "@/pages/messages/hooks/useThreadsData.ts";
import {Friend} from "@/components/app/messages/CreateThread.tsx";
import {AxiosError} from "axios";

export default function useChatWebSocket(
    inboxID: string,
    labyrinth: Labyrinth | null,
    addMessages: (addMessagesActionPayload: AddMessagesActionPayload) => void,
    addThreads: (addThreadsActionPayload: AddThreadsActionPayload) => void,
    addFriends: (friends: Friend[]) => void,
) {
    const {sendMessage, lastMessage, readyState} = useWebSocket<ReceivedSocketMessage>('ws://localhost:8080/ws', {
        onOpen: () => console.log('WebSocket connection opened!'),
        onClose: () => console.log('WebSocket connection closed!'),
        onMessage: (event) => console.log('Received message:', event.data),
        onError: (event) => console.error('WebSocket error:', event),
        shouldReconnect: () => true
    });
    const [error, setError] = useState<AxiosError | null>()

    useEffect(() => {
        if (lastMessage === null || labyrinth === null) return

        const socketMessage: ReceivedSocketMessage = JSON.parse(lastMessage.data)
        switch (socketMessage.type) {
            case "NEW_MESSAGES": {
                const encryptedMessagesPromise = Promise.all(socketMessage.payload.messages.map(async m => {
                            const newestEpochSequenceID = labyrinth.getNewestEpochSequenceID()
                            return {
                                id: m.id,
                                authorID: m.authorID,
                                encryptedContent: await labyrinth.encrypt(
                                    socketMessage.payload.threadID,
                                    newestEpochSequenceID,
                                    m.content,
                                ),
                                epochSequenceID: newestEpochSequenceID,
                                timestamp: m.timestamp,

                            } as LabyrinthEncryptedMessageGetDTO
                        }
                    )
                )
                encryptedMessagesPromise.then(encryptedMessages =>
                    axiosInstance.post<void>(
                        `api/labyrinth/epochs/${labyrinth.getNewestEpochID()}/inbox/${inboxID}/threads/${socketMessage.payload.threadID}/messages`,
                        encryptedMessages,
                    ).then(() =>
                        addMessages(socketMessage.payload)
                    )
                )
                break;
            }
            case "NEW_THREADS": {
                addThreads(socketMessage.payload)
                break
            }
            case "NEW_FRIEND": {
                addFriends([{
                    userID: socketMessage.payload.userID,
                    visibleName: socketMessage.payload.visibleName,
                }])
                break
            }
        }
    }, [addFriends, addMessages, addThreads, inboxID, labyrinth, lastMessage]);

    const handleSendMessage = (newMessage: NewMessageToSend) => {
        if (readyState === ReadyState.OPEN) {
            const newChatMessage: SocketMessageToSend = {
                type: "NEW_MESSAGE",
                payload: newMessage,
            }

            sendMessage(JSON.stringify(newChatMessage))
        }
        // TODO: HANDLE ELSE
    }

    const handleCreateThread = (newThread: NewThreadToSend) => {
        if (readyState === ReadyState.OPEN) {
            const newChatThread: SocketMessageToSend = {
                type: 'NEW_THREAD',
                payload: newThread,
            }

            sendMessage(JSON.stringify(newChatThread))
        }
        // TODO: HANDLE ELSE
    }

    return {error, handleSendMessage, handleCreateThread}
}