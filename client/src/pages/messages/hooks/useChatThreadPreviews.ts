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

export default function useChatThreadPreviews(inboxID: string | null,
                                              privateDevice: PrivateDevice | null,
                                              epochStorage: EpochStorage | null,
                                              setError: React.Dispatch<string>,
                                              setChosenThreadID: React.Dispatch<string>) {
    const [chatThreadPreviews, setChatThreadPreviews] = useState<IChatThreadPreview[]>([])

    useEffect(() => {
        if (epochStorage === null || privateDevice === null || inboxID === null) return

        axiosAPI.get<ThreadPreviewEncryptedGetDTO[]>(`/api/inbox/${inboxID}/threads/previews`)
            .then(async (threadPreviewsResponse) => {
                const chatThreadPreviewsDecrypted = [] as IChatThreadPreview[]

                for (const threadPreviewEncrypted of threadPreviewsResponse.data) {
                    // TODO: Refactoring - store list of promises then await and fill chatThreadPreviewsDecrypted in order
                    const threadPreviewDecrypted = await decryptThreadPreview(
                        epochStorage,
                        privateDevice,
                        threadPreviewEncrypted
                    )
                    chatThreadPreviewsDecrypted.push(threadPreviewDecrypted)
                }
                if(chatThreadPreviewsDecrypted.length > 0) {
                    setChosenThreadID(chatThreadPreviewsDecrypted[0].threadID)
                }
                setChatThreadPreviews(chatThreadPreviewsDecrypted)
            })
            .catch((error: unknown) => {
                let message = 'Unknown Error'
                if (error instanceof Error) message = error.message

                setError(message)
            })
    }, [inboxID, privateDevice, epochStorage, setError, setChosenThreadID])

    return [chatThreadPreviews, setChatThreadPreviews] as const
}