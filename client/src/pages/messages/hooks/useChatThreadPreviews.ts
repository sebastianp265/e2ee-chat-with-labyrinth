import React, {useEffect, useState} from "react";
import axiosAPI from "@/api/axiosAPI.ts";
import {ThreadPreviewEncryptedGetDTO} from "@/api/api-types.ts";
import {EpochStorage} from "@/lib/labyrinth/epoch/EpochStorage.ts";
import {decryptMessage, IEncryptedMessage} from "@/lib/labyrinth/labyrinth.ts";
import {PrivateDevice} from "@/lib/labyrinth/labyrinth-types.ts";
import {IChatThreadPreview} from "@/components/app/messages/ChatThreadPreview.tsx";

async function decryptThreadPreview(epochStorage: EpochStorage, selfDevice: PrivateDevice, threadPreviewEncrypted: ThreadPreviewEncryptedGetDTO): Promise<IChatThreadPreview> {
    const decryptedMessage = await decryptMessage(
        threadPreviewEncrypted.threadID,
        selfDevice,
        epochStorage,
        {
            ciphertext: threadPreviewEncrypted.lastMessageEncryptedContent,
            epochSequenceID: threadPreviewEncrypted.epochSequenceID
        } as IEncryptedMessage
    )

    return {
        threadID: threadPreviewEncrypted.threadID,
        threadName: threadPreviewEncrypted.threadName,
        lastMessage: decryptedMessage,
        lastMessageAuthorVisibleName: threadPreviewEncrypted.lastMessageAuthorVisibleName,
    }
}

export default function useChatThreadPreviews(privateDevice: PrivateDevice, epochStorage: EpochStorage, setError: React.Dispatch<string>) {
    const [chatThreadPreviews, setChatThreadPreviews] = useState<IChatThreadPreview[]>([])

    useEffect(() => {
        axiosAPI.get<ThreadPreviewEncryptedGetDTO[]>(`/api/threads/previews`)
            .then(async (threadPreviewsResponse) => {
                const chatThreadPreviewsDecrypted = [] as IChatThreadPreview[]

                try {
                    for (const threadPreviewEncrypted of threadPreviewsResponse.data) {
                        // TODO: Refactoring - store list of promises then await and fill chatThreadPreviewsDecrypted in order
                        const threadPreviewDecrypted = await decryptThreadPreview(epochStorage, privateDevice, threadPreviewEncrypted)
                        chatThreadPreviewsDecrypted.push(threadPreviewDecrypted)
                    }
                } catch (error) {
                    let message = 'Unknown Error'
                    if (error instanceof Error) message = error.message

                    setError(message)
                }

                setChatThreadPreviews(chatThreadPreviewsDecrypted)
            })
            .catch((error: Error) => {
                setError(error.message)
            })
    }, [epochStorage, privateDevice, setError])

    return [chatThreadPreviews, setChatThreadPreviews] as const
}