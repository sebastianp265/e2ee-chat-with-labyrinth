import httpClient from '@/api/httpClient.ts';
import { z } from 'zod';

const chatServicePrefix = '/api/chat-service';

const ChatMessageGetDTOSchema = z.object({
    id: z.string(),
    epochSequenceId: z.string(),
    encryptedMessageData: z.string(),
    timestamp: z.number(),
});

const ChatMessagePostDTOSchema = z.object({
    id: z.string(),
    epochId: z.string(),
    encryptedMessageData: z.string(),
    timestamp: z.number(),
});

const ChatThreadPreviewDTOSchema = z.object({
    threadId: z.string(),
    threadName: z.nullable(z.string()),
    message: ChatMessageGetDTOSchema,
    membersVisibleNameByUserId: z.record(z.string()),
});

export type ChatMessageGetDTO = z.infer<typeof ChatMessageGetDTOSchema>;
export type ChatMessagePostDTO = z.infer<typeof ChatMessagePostDTOSchema>;
export type ChatThreadPreviewDTO = z.infer<typeof ChatThreadPreviewDTOSchema>;

export const chatService = {
    storeMessage: async (threadId: string, chatMessage: ChatMessagePostDTO) => {
        ChatMessagePostDTOSchema.parse(chatMessage);
        return (
            await httpClient.post<void>(
                `${chatServicePrefix}/threads/${threadId}/messages`,
                chatMessage,
            )
        ).data;
    },
    getMessages: async (threadId: string) => {
        const data = (
            await httpClient.get(
                `${chatServicePrefix}/threads/${threadId}/messages`,
            )
        ).data;
        return z
            .array(ChatMessageGetDTOSchema)
            .parse(data) as ChatMessageGetDTO[];
    },
    getThreadPreviews: async () => {
        const data = (
            await httpClient.get(`${chatServicePrefix}/threads/previews`)
        ).data;
        return z
            .array(ChatThreadPreviewDTOSchema)
            .parse(data) as ChatThreadPreviewDTO[];
    },
};
