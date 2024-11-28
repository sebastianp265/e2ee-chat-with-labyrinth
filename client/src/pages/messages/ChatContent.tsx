import {Button} from "@/components/ui/button.tsx";
import ThreadPreview from "@/components/app/messages/ThreadPreview.tsx";
import useThreadsData, {threadPreviewDataFromThreadData} from "@/pages/messages/hooks/useThreadsData.ts";
import CreateThread from "@/components/app/messages/CreateThread.tsx";
import Thread from "@/components/app/messages/Thread.tsx";
import useChatWebSocket from "@/pages/messages/hooks/useChatWebSocket.ts";
import {useState} from "react";
import useFriendsData from "@/pages/messages/hooks/useFriendsData.ts";
import {Labyrinth} from "@/lib/labyrinth/Labyrinth.ts";

type ChatContentProps = {
    loggedUserID: string,
    labyrinth: Labyrinth | null,
}

export default function ChatContent({
                                        loggedUserID,
                                        labyrinth,
                                    }: Readonly<ChatContentProps>) {
    const {
        threadsData,
        chosenThreadID,
        error: threadsDataError,
        setChosenThreadID,
        addThreads,
        addMessages
    } = useThreadsData(
        labyrinth,
    )

    const {friends, error: friendsDataError, addFriends} = useFriendsData()

    const {handleSendMessage, error: chatWebSocketError, handleCreateThread} = useChatWebSocket(
        labyrinth,
        addMessages,
        addThreads,
        addFriends,
    )


    const [createThreadOpen, setCreateThreadOpen] = useState<boolean>(false)

    return (
        <>
            <div className="flex flex-col space-y-2 border p-2 w-[20%]">
                <Button onClick={() => {
                    setCreateThreadOpen(true)
                }}>Create new thread</Button>
                {
                    threadsData.keys.map(threadID =>
                        <ThreadPreview
                            key={threadID}
                            threadPreviewData={threadPreviewDataFromThreadData(threadID, threadsData.map[threadID])}
                            onClick={() => {
                                setCreateThreadOpen(false)
                                setChosenThreadID(threadID)
                            }}
                            chosenThreadID={chosenThreadID}
                        />
                    )
                }
            </div>
            <div className="flex p-2 flex-grow border border-l-0 flex-col w-full">
                {
                    createThreadOpen ?
                        <CreateThread
                            friends={friends}
                            handleCreateThread={(newThread) => {
                                handleCreateThread(newThread)
                                setCreateThreadOpen(false)
                            }}
                        />
                        :
                        chosenThreadID !== null &&
                        <Thread
                            loggedUserID={loggedUserID}
                            threadData={threadsData.map[chosenThreadID]}
                            handleSendMessage={(messageContent: string) => handleSendMessage({
                                threadID: chosenThreadID,
                                content: messageContent
                            })}
                        />
                }
            </div>
        </>
    )
}