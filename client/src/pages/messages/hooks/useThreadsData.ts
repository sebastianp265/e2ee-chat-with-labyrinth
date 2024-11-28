import {useEffect, useReducer, useState} from "react";
import axiosInstance from "@/api/axios/axiosInstance.ts";
import {Labyrinth} from "@/lib/labyrinth/Labyrinth.ts";
import {ThreadData} from "@/components/app/messages/Thread.tsx";
import {ThreadPreviewData} from "@/components/app/messages/ThreadPreview.tsx";
import {Message} from "@/components/app/messages/Messages.tsx";
import {AxiosError} from "axios";

export function threadPreviewDataFromThreadData(threadID: string, threadData: ThreadData): ThreadPreviewData {
    return {
        threadID,
        threadName: threadData.threadName,
        lastMessage: threadData.messages.length > 0 ? threadData.messages[0].content : null,
        lastMessageAuthorVisibleName: threadData.messages.length > 0 ? threadData.membersVisibleNameByUserID[threadData.messages[0].authorID] : null,
    }
}

export type ThreadsDataStore = {
    map: {
        [threadID: string]: ThreadData,
    },
    keys: string[],
}

export type AddMessagesActionPayload = {
    threadID: string,
    messages: Message[],
}

export type LabyrinthEncryptedMessageGetDTO = {
    id: string,
    epochSequenceID: string,
    authorID: string,
    encryptedContent: Uint8Array,
    timestamp: number,
}

export type AddThreadsActionPayload = ({
    threadID: string,
} & ThreadData)[]

type Action =
    | { type: 'ADD_MESSAGES', payload: AddMessagesActionPayload }
    | { type: 'ADD_THREADS', payload: AddThreadsActionPayload }

function threadsDataReducer(state: ThreadsDataStore, action: Action): ThreadsDataStore {
    switch (action.type) {
        case 'ADD_MESSAGES': {
            const {threadID, messages} = action.payload;

            if (!Object.hasOwn(state.map, threadID)) {
                // TODO: Investigate
                throw new Error("Unexpected behaviour, message should be added to existing thread")
            }

            return {
                map: {
                    ...state.map,
                    [threadID]: {
                        ...state.map[threadID],
                        messages: [
                            ...messages,
                            ...state.map[threadID].messages,
                        ],
                    }
                },
                keys: [
                    threadID,
                    ...state.keys.filter((key => key !== threadID)),
                ],
            }
        }
        case "ADD_THREADS": {
            const threadsDataWithID = action.payload;

            return {
                map: {
                    ...state.map,
                    ...Object.fromEntries(
                        threadsDataWithID.map(value => [value.threadID, {
                            messages: value.messages,
                            threadName: value.threadName,
                            membersVisibleNameByUserID: value.membersVisibleNameByUserID,
                        } as ThreadData])
                    )
                },
                keys: [
                    ...threadsDataWithID.map(value => value.threadID),
                    ...state.keys
                ]
            }
        }
    }
}

export default function useThreadsData(
    labyrinth: Labyrinth | null,
) {
    const [chosenThreadID, setChosenThreadID] = useState<string | null>(null)
    const [threadsData, dispatch] = useReducer(threadsDataReducer, {
        map: {},
        keys: [],
    })
    const [error, setError] = useState<AxiosError | null>(null)

    function addMessages(addMessagesActionPayload: AddMessagesActionPayload) {
        dispatch({type: 'ADD_MESSAGES', payload: addMessagesActionPayload})
    }

    function addThreads(addThreadsActionPayload: AddThreadsActionPayload) {
        dispatch({type: 'ADD_THREADS', payload: addThreadsActionPayload})
    }

    useEffect(() => {
        if (labyrinth === null) return

        axiosInstance.get<AddThreadsActionPayload>(`/api/labyrinth/inbox/${labyrinth.inboxID}/threads/previews`)
            .then(response => {
                addThreads(response.data)

                if (response.data.length > 0) {
                    setChosenThreadID(response.data[0].threadID)
                }
            })
            .catch(setError)
    }, [labyrinth]);

    useEffect(() => {
        if (chosenThreadID === null || labyrinth === null) return

        axiosInstance.get<LabyrinthEncryptedMessageGetDTO[]>(`/api/labyrinth/inbox/${labyrinth.inboxID}/thread/${chosenThreadID}/messages`)
            .then(async (response) => {
                const encryptedMessages = response.data
                const decryptedMessages = await Promise.all(encryptedMessages.map(async encryptedMessage => {
                        const decryptedContent = await labyrinth.decrypt(
                            chosenThreadID,
                            encryptedMessage.epochSequenceID,
                            encryptedMessage.encryptedContent
                        )
                        return {
                            id: encryptedMessage.id,
                            content: decryptedContent,
                            authorID: encryptedMessage.authorID,
                        } as Message
                    })
                )
                addMessages({
                    threadID: chosenThreadID,
                    messages: decryptedMessages
                })
            })
            .catch(setError)
    }, [chosenThreadID, labyrinth, setError]);

    return {threadsData, chosenThreadID, error, setChosenThreadID, addMessages, addThreads} as const;
}