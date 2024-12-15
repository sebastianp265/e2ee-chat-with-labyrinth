import { useCallback, useEffect, useReducer, useState } from 'react';
import { Labyrinth } from '@/lib/labyrinth/Labyrinth.ts';
import { AxiosError } from 'axios';
import {
    ChatMessageGetDTO,
    ChatMessagePostDTO,
    chatService,
} from '@/api/chatService.ts';
import { z } from 'zod';

export type ThreadsDataStore = {
    map: {
        [threadId: string]: {
            threadName: string | null;
            messages: Message[];
            membersVisibleNameByUserId: {
                [userId: string]: string;
            };
        };
    };
    keys: string[];
};

const MessageSchema = z.object({
    id: z.string(),
    authorId: z.string(),
    content: z.string(),
    timestamp: z.number(),
});

const AddMessageActionPayloadSchema = z.object({
    threadId: z.string(),
    message: MessageSchema,
});

const AddThreadActionPayloadSchema = z.object({
    threadId: z.string(),
    threadName: z.string().nullable(),
    initialMessage: MessageSchema,
    membersVisibleNameByUserId: z.record(z.string(), z.string()),
});

export type Message = z.infer<typeof MessageSchema>;
export type AddMessageActionPayload = z.infer<
    typeof AddMessageActionPayloadSchema
>;
export type AddThreadActionPayload = z.infer<
    typeof AddThreadActionPayloadSchema
>;

const LabyrinthMessageDataSchema = z.object({
    authorId: z.string(),
    content: z.string(),
});

type LabyrinthMessageData = z.infer<typeof LabyrinthMessageDataSchema>;

async function decryptMessage(
    labyrinth: Labyrinth,
    chosenThreadId: string,
    encryptedMessage: ChatMessageGetDTO,
): Promise<Message> {
    const decryptedMessageData = await labyrinth.decrypt(
        chosenThreadId,
        encryptedMessage.epochSequenceId,
        encryptedMessage.encryptedMessageData,
    );

    const { content, authorId } = LabyrinthMessageDataSchema.parse(
        JSON.parse(decryptedMessageData),
    );

    return {
        id: encryptedMessage.id,
        content,
        authorId: authorId,
        timestamp: encryptedMessage.timestamp,
    } as Message;
}

async function encryptMessageAndStoreInLabyrinth(
    labyrinth: Labyrinth,
    threadId: string,
    message: Message,
) {
    async function createMessagePostDTO(m: Message) {
        const newestEpochId = labyrinth.getNewestEpochId();
        const newestEpochSequenceId = labyrinth.getNewestEpochSequenceId();

        return {
            id: m.id,
            epochId: newestEpochId,
            encryptedMessageData: await labyrinth.encrypt(
                threadId,
                newestEpochSequenceId,
                JSON.stringify({
                    content: m.content,
                    authorId: m.authorId,
                } as LabyrinthMessageData),
            ),
            timestamp: m.timestamp,
        } as ChatMessagePostDTO;
    }

    return chatService.storeMessage(
        threadId,
        await createMessagePostDTO(message),
    );
}

type Action =
    | { type: 'ADD_MESSAGE'; payload: AddMessageActionPayload }
    | { type: 'ADD_THREAD'; payload: AddThreadActionPayload };

function combineMessages(prevMessages: Message[], messageToAdd: Message) {
    const insertIndex = prevMessages.findIndex(
        (m) => m.timestamp >= messageToAdd.timestamp,
    );
    if (insertIndex === -1) {
        return [...prevMessages, messageToAdd];
    }
    if (prevMessages[insertIndex].id === messageToAdd.id) {
        return prevMessages;
    }

    return [
        ...prevMessages.slice(0, insertIndex),
        messageToAdd,
        ...prevMessages.slice(insertIndex),
    ];
}

function threadsDataReducer(
    state: ThreadsDataStore,
    action: Action,
): ThreadsDataStore {
    switch (action.type) {
        case 'ADD_MESSAGE': {
            const { threadId, message } = action.payload;

            if (Object.hasOwn(state.map, threadId)) {
                return {
                    map: {
                        ...state.map,
                        [threadId]: {
                            ...state.map[threadId],
                            messages: combineMessages(
                                state.map[threadId].messages,
                                message,
                            ),
                        },
                    },
                    keys: [
                        threadId,
                        ...state.keys.filter((key) => key !== threadId),
                    ],
                };
            }

            return {
                map: {
                    ...state.map,
                    [threadId]: {
                        threadName: null,
                        messages: [message],
                        membersVisibleNameByUserId: {},
                    },
                },
                keys: [
                    threadId,
                    ...state.keys.filter((key) => key !== threadId),
                ],
            };
        }
        case 'ADD_THREAD': {
            const {
                threadId,
                threadName,
                initialMessage,
                membersVisibleNameByUserId,
            } = action.payload;

            return {
                map: {
                    ...state.map,
                    [threadId]: {
                        threadName,
                        messages: [initialMessage],
                        membersVisibleNameByUserId,
                    },
                },
                keys: [
                    threadId,
                    ...state.keys.filter((key) => key !== threadId),
                ],
            };
        }
    }
}

export default function useThreadsData(labyrinth: Labyrinth | null) {
    const [chosenThreadId, setChosenThreadId] = useState<string | null>(null);
    const [threadsDataStore, dispatch] = useReducer(threadsDataReducer, {
        map: {},
        keys: [],
    });
    const [error, setError] = useState<AxiosError | null>(null);

    const addMessage = useCallback(
        (addMessageActionPayload: AddMessageActionPayload) => {
            if (labyrinth === null)
                throw new Error(
                    "Unexpected behaviour, when labyrinth is not initialized user shouldn't be able to receive or send messages",
                );
            AddMessageActionPayloadSchema.parse(addMessageActionPayload);

            dispatch({ type: 'ADD_MESSAGE', payload: addMessageActionPayload });
            encryptMessageAndStoreInLabyrinth(
                labyrinth,
                addMessageActionPayload.threadId,
                addMessageActionPayload.message,
            );
        },
        [labyrinth],
    );

    const addThread = useCallback(
        (addThreadActionPayload: AddThreadActionPayload) => {
            if (labyrinth === null)
                throw new Error(
                    "Unexpected behaviour, when labyrinth is not initialized user shouldn't be able to receive or send messages",
                );
            AddThreadActionPayloadSchema.parse(addThreadActionPayload);

            dispatch({ type: 'ADD_THREAD', payload: addThreadActionPayload });
            encryptMessageAndStoreInLabyrinth(
                labyrinth,
                addThreadActionPayload.threadId,
                addThreadActionPayload.initialMessage,
            );
        },
        [labyrinth],
    );

    useEffect(() => {
        if (labyrinth === null) return;

        chatService.getThreadPreviews().then(async (chatThreadPreviews) => {
            for (const p of chatThreadPreviews) {
                const message = await decryptMessage(
                    labyrinth,
                    p.threadId,
                    p.message,
                );
                addThread({
                    threadId: p.threadId,
                    threadName: p.threadName,
                    initialMessage: message,
                    membersVisibleNameByUserId: p.membersVisibleNameByUserId,
                });
            }
        });
    }, [addThread, labyrinth]);

    useEffect(() => {
        if (chosenThreadId === null || labyrinth === null) return;

        chatService
            .getMessages(chosenThreadId)
            .then(async (encryptedMessages) => {
                for (const em of encryptedMessages) {
                    const message = await decryptMessage(
                        labyrinth,
                        chosenThreadId,
                        em,
                    );
                    addMessage({
                        threadId: chosenThreadId,
                        message,
                    });
                }
            });
    }, [addMessage, chosenThreadId, labyrinth, setError]);

    return {
        addMessage,
        addThread,
        threadsDataStore,
        chosenThreadId,
        setChosenThreadId,
        error,
    } as const;
}
