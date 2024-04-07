import {ISessionProps} from "@/SessionCheckWrapper.tsx";
import {MessageGetDTO, ThreadPreviewGetDTO, UserIdToName} from "@/api/types.ts";
import ThreadPreview from "@/components/app/messages/ThreadPreview.tsx";
import Thread from "@/components/app/messages/Thread.tsx";
import {useEffect, useState} from "react";
import axiosAPI from "@/api/axiosAPI.ts";

export default function MessagesPage({inactivateSession}: Readonly<ISessionProps>) {
    const inboxIdOrNull = localStorage.getItem(import.meta.env.VITE_INBOX_ID)
    const inboxId = inboxIdOrNull != null ? parseInt(inboxIdOrNull) : -1
    if (inboxId == -1) {
        console.error("Inbox id info has been removed from local storage")
        inactivateSession?.()
    }
    const loggedUserIdOrNull = localStorage.getItem(import.meta.env.VITE_USER_ID)
    const loggedUserId = loggedUserIdOrNull != null ? parseInt(loggedUserIdOrNull) : -1
    if (inboxId == -1) {
        console.error("User id info has been removed from local storage")
        inactivateSession?.()
    }

    const [threadPreviews, setThreadPreviews] = useState<ThreadPreviewGetDTO[]>([])
    const [chosenThreadId, setChosenThreadId] = useState<number>(-1)
    const [chosenThreadName, setChosenThreadName] = useState("")

    useEffect(() => {
        axiosAPI.get<ThreadPreviewGetDTO[]>("/api/threads")
            .then(response => {
                const threadPreviews = response.data
                setThreadPreviews(threadPreviews)
                if (threadPreviews.length == 0) return
                setChosenThreadId(threadPreviews[0].threadId)
                setChosenThreadName(threadPreviews[0].threadName)
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
        if(chosenThreadId == -1) return
        axiosAPI.get<UserIdToName>(`/api/threads/${chosenThreadId}/members`)
            .then(response => {
                setUserIdToNameForChosenThread(response.data)
            })
        axiosAPI.get<MessageGetDTO[]>(`/api/messages/inbox/${inboxId}/thread/${chosenThreadId}`)
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
                        messagesForChosenThread[messagesForChosenThread.length - 1].id + 1: 0,
                    authorId: loggedUserId,
                    content: messageContent
                }])
            })
    }

    return (
        <div className="flex h-full">
            <div className="flex flex-col space-y-2 border p-2">
                {
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