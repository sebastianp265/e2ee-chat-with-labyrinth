import {ISessionProps} from "@/SessionCheckWrapper.tsx";
import {
    EncryptedPrevEpochMetadataGetDTO,
    SharedEntropyGetDTO,
    ThreadPreviewEncryptedGetDTO,
    UserIdToNameMap
} from "@/api/types.ts";
import ThreadPreview, {ThreadPreviewDTO} from "@/components/app/messages/ThreadPreview.tsx";
import Thread from "@/components/app/messages/Thread.tsx";
import {useEffect, useState} from "react";
import axiosAPI from "@/api/axiosAPI.ts";
import {Button} from "@/components/ui/button.tsx";
import UserPreview from "@/components/app/messages/UserPreview.tsx";
import {usePrivateRouteContext} from "@/main.tsx";
import {decryptPrevEpoch, Epoch, joinNewEpoch, SelfDevice} from "@/lib/labyrinth/epoch.ts";
import {initializeLabyrinth} from "@/lib/labyrinth/labyrinth.ts";
import {kdf_one_key} from "@/lib/labyrinth/crypto/key_derivation.ts";
import {decrypt} from "@/lib/labyrinth/crypto/authenticated_symmetric_encryption.ts";

export default function MessagesPage({inactivateSession}: Readonly<ISessionProps>) {
    const {loggedUserID} = usePrivateRouteContext()
    const [threadIDToEpochMap, setThreadIDToEpochMap]
        = useState<{ [threadID: string]: Epoch }>({})
    const [device, setDevice] = useState<SelfDevice | undefined>()
    const [threadPreviews, setThreadPreviews] = useState<ThreadPreviewDTO[]>([])
    const [chosenThreadPreview, setChosenThreadPreview] = useState<ThreadPreviewDTO | undefined>()

    useEffect(() => {
        const threadIDToEpochMapSaved = localStorage.getItem(`epochs_user_${loggedUserID}`)
        if (threadIDToEpochMapSaved != null) {
            setThreadIDToEpochMap(JSON.parse(threadIDToEpochMapSaved))
        }
    }, []);

    useEffect(() => {
        const deviceSerialized = localStorage.getItem(`device_user_${loggedUserID}`)
        if (deviceSerialized == null) {
            const keyBundle = initializeLabyrinth()
            axiosAPI.post(`api/labyrinth/device/register`, keyBundle)
                .then(response => {
                    const deviceID = response.data
                    const deviceToSave = {
                        id: deviceID,
                        keyBundle: keyBundle
                    }
                    localStorage.setItem(`device_user_${loggedUserID}`, JSON.stringify(deviceToSave))
                    setDevice(deviceToSave)
                })
        } else {
            const deviceDeserialized: SelfDevice = JSON.parse(deviceSerialized)
            setDevice(deviceDeserialized)
        }
    }, []);

    const decryptMessage = (epoch: Epoch, threadID: string, messageContentEncrypted: Buffer) => {
        const messageKey = kdf_one_key(
            epoch.rootKey,
            Buffer.alloc(0),
            Buffer.from(`message_key_in_epoch_${epoch.sequenceID.toString()}_cipher_version_3_thread_${threadID}`)
        )
        return decrypt(
            messageKey,
            Buffer.from(`message_thread_${threadID}`),
            messageContentEncrypted
        ).toString()
    }

    useEffect(() => {
        if (device == undefined) return

        // check if new epoch root keys wait
        axiosAPI.get<ThreadPreviewEncryptedGetDTO[]>("/api/threads")
            .then(response => {
                const visibleThreadPreviews: ThreadPreviewDTO[] = []
                for (const threadPreviewEncrypted of response.data) {
                    let currentEpochToDecrypt = threadIDToEpochMap[threadPreviewEncrypted.threadID]
                    if (currentEpochToDecrypt != undefined) {
                        while (threadPreviewEncrypted.metadata.epoch.sequenceID < currentEpochToDecrypt.sequenceID) {
                            const response = await axiosAPI.get<EncryptedPrevEpochMetadataGetDTO>(`api/labyrinth/epoch/encrypted/
                            by-thread/${threadPreviewEncrypted.threadID}/by-sequence-id/${currentEpochToDecrypt.sequenceID}`)

                            // TODO: do error handling
                            const currentEpochToDecryptWithoutID = decryptPrevEpoch(
                                currentEpochToDecrypt.rootKey,
                                currentEpochToDecrypt.sequenceID,
                                response.data
                            )

                            currentEpochToDecrypt = {
                                ...currentEpochToDecryptWithoutID,
                                id: response.data.id
                            }
                        }
                        while (threadPreviewEncrypted.metadata.epoch.sequenceID > currentEpochToDecrypt.sequenceID) {
                            const response = await axiosAPI.get<SharedEntropyGetDTO>(`api/labyrinth/epoch/entropy
                            /by-thread/${threadPreviewEncrypted.threadID}/by-sequence-id/${currentEpochToDecrypt.sequenceID}`)

                            // TODO: do error handling
                            currentEpochToDecrypt = {
                                ...joinNewEpoch(
                                    device,
                                    response.data.senderDevice,
                                    currentEpochToDecrypt,
                                    response.data.encryptedEntropy
                                ),
                                id: response.data.newEpochID
                            }

                            setThreadIDToEpochMap({
                                ...threadIDToEpochMap,
                                [threadPreviewEncrypted.threadID]: currentEpochToDecrypt
                            })
                        }
                        visibleThreadPreviews.push({
                            threadID: threadPreviewEncrypted.threadID,
                            threadName: threadPreviewEncrypted.threadName,
                            lastMessageAuthorVisibleName: threadPreviewEncrypted.lastMessageAuthorVisibleName,
                            lastMessage: decryptMessage(
                                currentEpochToDecrypt,
                                threadPreviewEncrypted.threadID,
                                threadPreviewEncrypted.lastMessageEncryptedContent
                            )
                        })
                    }
                }
            })
            .catch(error => {
                // TODO: ERROR HANDLING
                console.error(error)
                inactivateSession?.()
            })
    }, [inactivateSession]);

    const [messagesForChosenThread, setMessagesForChosenThread] = useState<MessageGetDTO[]>([])
    const [userIdToNameForChosenThread, setUserIdToNameForChosenThread] = useState<UserIdToName>({})

    useEffect(() => {
        if (chosenThreadPreview == undefined) return
        axiosAPI.get<UserIdToNameMap>(`/api/threads/${chosenThreadPreview.threadId}/members`)
            .then(response => {
                setUserIdToNameForChosenThread(response.data)
            })
        axiosAPI.get<MessageGetDTO[]>(`/api/messages/device/${}/thread/${chosenThreadPreview.threadId}`)
            .then(response => {
                setMessagesForChosenThread(response.data)
            })
            .catch(error => {
                // TODO: ERROR HANDLING
                console.error(error)
                inactivateSession?.()
            })
    }, [chosenThreadId, inactivateSession, inboxId]);

    const handleSendMessage = (messageContent: string) => {
        axiosAPI.post(`/api/messages/thread/${chosenThreadId}`, {
            content: messageContent
        })
            .then(() => {
                setMessagesForChosenThread([...messagesForChosenThread, {
                    id: messagesForChosenThread.length > 0 ?
                        messagesForChosenThread[messagesForChosenThread.length - 1].id + 1 : 0,
                    authorId: loggedUserId,
                    content: messageContent
                }])
            })
    }

    const [friends, setFriends] = useState<UserGetDTO[]>([])

    useEffect(() => {
        setFriends([
            {
                userId: 1,
                visibleName: "Krzysztof"
            },
            {
                userId: 2,
                visibleName: "Arkadiusz"
            }
        ])
    }, []);

    const [newConversationPanelOpen, setNewConversationPanelOpen] = useState(false)

    const createThread = (userId: number) => {
        axiosAPI.post(`api/threads/with-user/${userId}`)
            .then(response => {
                re
            })
    }

    return (
        <div className="flex h-full">
            <div className="flex flex-col space-y-2 border p-2 w-[20%]">
                {
                    newConversationPanelOpen ?
                        <Button onClick={() => setNewConversationPanelOpen(false)}>Close</Button> :
                        <Button onClick={() => setNewConversationPanelOpen(true)}>New conversation</Button>
                }
                {
                    newConversationPanelOpen &&
                    friends.map(friend =>
                        <UserPreview key={friend.userId}
                                     userId={friend.userId}
                                     visibleName={friend.visibleName}
                                     onClick={createThread}/>
                    )
                }
                {
                    !newConversationPanelOpen &&
                    threadPreviews.map(threadPreview =>
                        <ThreadPreview onClick={() => setChosenThreadId(threadPreview.threadId)}
                                       chosenThreadId={chosenThreadId}
                                       threadPreview={threadPreview}
                                       key={threadPreview.threadId}
                        />
                    )
                }
            </div>
            <div className="flex p-2 flex-grow border border-l-0">
                {
                    chosenThreadId != -1 &&
                    <Thread
                        threadName={chosenThreadName}
                        loggedUserId={loggedUserId}
                        handleSendMessage={handleSendMessage}
                        messages={messagesForChosenThread}
                        userIdToName={userIdToNameForChosenThread}
                    />
                }
            </div>
        </div>
    )
}