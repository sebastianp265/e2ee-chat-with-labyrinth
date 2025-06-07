import { useCallback, useEffect, useReducer, useState } from 'react';
import {
    ChatMessageGetDTO,
    ChatMessagePostDTO,
    chatService,
} from '@/api/chatService.ts';
import { z } from 'zod';
import {
    bytesSerializerProvider,
    Labyrinth,
} from '@sebastianp265/safe-server-side-storage-client';
import { threadsDataReducer } from '@/pages/messages/utils/threadsData.ts';
import { CustomApiError } from '@/lib/errorUtils.ts';

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

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

function decryptMessage(
    labyrinth: Labyrinth,
    chosenThreadId: string,
    encryptedMessage: ChatMessageGetDTO,
): Message {
    const decryptedMessageData = textDecoder.decode(
        labyrinth.decrypt(
            chosenThreadId,
            encryptedMessage.epochSequenceId,
            bytesSerializerProvider.bytesSerializer.deserialize(
                encryptedMessage.encryptedMessageData,
            ),
        ),
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
    const newestEpochId = labyrinth.getNewestEpochId();
    const newestEpochSequenceId = labyrinth.getNewestEpochSequenceId();

    const messagePostDTO = {
        id: message.id,
        epochId: newestEpochId,
        encryptedMessageData: bytesSerializerProvider.bytesSerializer.serialize(
            labyrinth.encrypt(
                threadId,
                newestEpochSequenceId,
                textEncoder.encode(
                    JSON.stringify({
                        content: message.content,
                        authorId: message.authorId,
                    } as LabyrinthMessageData),
                ),
            ),
        ),
        timestamp: message.timestamp,
    } as ChatMessagePostDTO;

    return chatService.storeMessage(threadId, messagePostDTO);
}

export default function useThreadsData(labyrinth: Labyrinth | null) {
    const [chosenThreadId, setChosenThreadId] = useState<string | null>(null);
    const [threadsDataStore, dispatch] = useReducer(threadsDataReducer, {
        map: {},
        keys: [],
    });
    const [error, setError] = useState<CustomApiError | null>(null);

    const addMessageToStore = useCallback(
        (addMessageActionPayload: AddMessageActionPayload) => {
            AddMessageActionPayloadSchema.parse(addMessageActionPayload);
            dispatch({ type: 'ADD_MESSAGE', payload: addMessageActionPayload });
        },
        [labyrinth],
    );

    const addThreadToStore = useCallback(
        (addThreadActionPayload: AddThreadActionPayload) => {
            AddThreadActionPayloadSchema.parse(addThreadActionPayload);
            dispatch({ type: 'ADD_THREAD', payload: addThreadActionPayload });
        },
        [labyrinth],
    );

    const encryptAndPostMessage = useCallback(
        (threadId: string, message: Message) => {
            if (labyrinth === null)
                throw new Error(
                    "Unexpected behaviour, when labyrinth is not initialized user shouldn't be able to receive or send messages",
                );
            encryptMessageAndStoreInLabyrinth(
                labyrinth,
                threadId,
                message,
            ).catch(setError);
        },
        [labyrinth],
    );

    useEffect(() => {
        if (labyrinth === null) return;

        chatService
            .getThreadPreviews()
            .then((chatThreadPreviews) => {
                for (const p of chatThreadPreviews) {
                    const message = decryptMessage(
                        labyrinth,
                        p.threadId,
                        p.message,
                    );
                    addThreadToStore({
                        threadId: p.threadId,
                        threadName: p.threadName,
                        initialMessage: message,
                        membersVisibleNameByUserId:
                            p.membersVisibleNameByUserId,
                    });
                }
            })
            .catch(setError);
    }, [addThreadToStore, labyrinth]);

    useEffect(() => {
        if (chosenThreadId === null && threadsDataStore.keys.length > 0) {
            setChosenThreadId(threadsDataStore.keys[0]);
        }
    }, [chosenThreadId, threadsDataStore]);

    useEffect(() => {
        if (chosenThreadId === null || labyrinth === null) return;

        chatService
            .getMessages(chosenThreadId)
            .then((encryptedMessages) => {
                for (const em of encryptedMessages) {
                    const message = decryptMessage(
                        labyrinth,
                        chosenThreadId,
                        em,
                    );
                    addMessageToStore({
                        threadId: chosenThreadId,
                        message,
                    });
                }
            })
            .catch(setError);
    }, [addMessageToStore, chosenThreadId, labyrinth, setError]);

    return {
        addMessageToStore,
        addThreadToStore,
        encryptAndPostMessage,
        threadsDataStore,
        chosenThreadId,
        setChosenThreadId,
        error,
    } as const;
}
