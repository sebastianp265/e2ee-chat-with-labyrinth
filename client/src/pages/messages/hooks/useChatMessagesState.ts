import React, {useEffect, useState} from "react";
import {IMessage} from "@/components/app/messages/ChatThread.tsx";
import axiosAPI from "@/api/axiosAPI.ts";
import {EncryptedMessageGetDTO} from "@/api/api-types.ts";
import {EpochStorage} from "@/lib/labyrinth/epoch/EpochStorage.ts";
import {decryptMessage} from "@/lib/labyrinth/labyrinth.ts";
import {PrivateDevice} from "@/lib/labyrinth/labyrinth-types.ts";


export default function useChatMessagesState(inboxID: string | null,
                                             chosenThreadID: string | null,
                                             selfDevice: PrivateDevice | null,
                                             epochStorage: EpochStorage | null,
                                             setError: React.Dispatch<string>) {
    const [messages, setMessages] = useState<IMessage[]>([])

    useEffect(() => {
        if(inboxID === null || chosenThreadID === null || selfDevice === null || epochStorage === null) return

        axiosAPI.get<EncryptedMessageGetDTO[]>(`/api/inbox/${inboxID}/thread/${chosenThreadID}/messages`)
            .then((response) => {
                const encryptedMessages = response.data
                const decryptedMessagePromises = encryptedMessages.map(async encryptedMessage => {
                    return {
                        id: encryptedMessage.id,
                        content: await decryptMessage(
                            chosenThreadID,
                            selfDevice,
                            epochStorage,
                            {
                                ciphertext: encryptedMessage.encryptedContent,
                                epochSequenceID: encryptedMessage.epochSequenceID
                            }
                        ),
                        authorID: encryptedMessage.authorID,
                    } as IMessage
                })

                Promise.all(
                    decryptedMessagePromises
                ).then(decryptedMessages => setMessages(decryptedMessages))
            })
            .catch((error: unknown) => {
                let message = 'Unknown Error'
                if (error instanceof Error) message = error.message

                setError(message)
            })
    }, [inboxID, chosenThreadID, selfDevice, epochStorage, setError]);

    return [messages, setMessages] as const;
}