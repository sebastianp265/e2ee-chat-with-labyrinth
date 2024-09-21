import {ISessionProps} from "@/SessionCheckWrapper.tsx";
import ChatThreadPreview from "@/components/app/messages/ChatThreadPreview.tsx";
import ChatThread from "@/components/app/messages/ChatThread.tsx";
import {useState} from "react";
import {Button} from "@/components/ui/button.tsx";
import UserPreview from "@/components/app/messages/UserPreview.tsx";
import useChatThreadPreviews from "@/pages/messages/hooks/useChatThreadPreviews.ts";
import useDeviceInfoState from "@/pages/messages/hooks/useDeviceInfoState.ts";
import useEpochStorageState from "@/pages/messages/hooks/useEpochStorageState.ts";
import useChatMessagesState from "@/pages/messages/hooks/useChatMessagesState.ts";
import {INBOX_ID_KEY} from "@/constants.ts";
import useFriendsState from "@/pages/messages/hooks/useFriendsState.ts";
import {usePrivateRouteContext} from "@/main.tsx";
import useUserIDToNameMapForChosenThreadState from "@/pages/messages/hooks/useUserIDToNameMapForChosenThreadState.ts";

function loadInboxIDFromLocalStorage() {
    return localStorage.getItem(INBOX_ID_KEY)
}

export default function MessagesPage({inactivateSession}: Readonly<ISessionProps>) {
    const {loggedUserID} = usePrivateRouteContext()

    const [deviceInfo, setDeviceInfo] = useDeviceInfoState()
    const [epochStorage, setEpochStorage] = useEpochStorageState()
    const [inboxID, setInboxID] = useState<string | null>(loadInboxIDFromLocalStorage())

    const [error, setError] = useState<string | null>(null);

    const [chosenThreadID, setChosenThreadID] = useState<string | null>(null)
    const [chatThreadPreviews, setChatThreadPreviews] = useChatThreadPreviews(
        inboxID,
        deviceInfo,
        epochStorage,
        setError,
        setChosenThreadID
    )

    const [messagesForChosenThread, setMessagesForChosenThread] = useChatMessagesState(
        inboxID,
        chosenThreadID,
        deviceInfo,
        epochStorage,
        setError
    )

    const [userIDToNameMapForChosenThread, setUserIDToNameMapForChosenThread] = useUserIDToNameMapForChosenThreadState(
        chosenThreadID,
        setError
    )

    const [friends, setFriends] = useFriendsState(
        setError
    )

    const [newConversationPanelOpen, setNewConversationPanelOpen] = useState(false)

    const createThreadWith = async (userID: string) => {
        // TODO:
        console.log("Creating thread not implemented yet!")
    }

    const sendMessage = async (messageContent: string) {
        // TODO:
        console.log("Sending message not implemented yet")
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
                        <UserPreview key={friend.userID}
                                     userID={friend.userID}
                                     visibleName={friend.visibleName}
                                     onClick={() => createThreadWith(friend.userID)}/>
                    )
                }
                {
                    !newConversationPanelOpen &&
                    chatThreadPreviews.map(threadPreview =>
                        <ChatThreadPreview
                            key={threadPreview.threadID}
                            onClick={() => setChosenThreadID(threadPreview.threadID)}
                            chosenChatThreadID={chosenThreadID}
                            chatThreadPreview={threadPreview}
                        />
                    )
                }
            </div>
            <div className="flex p-2 flex-grow border border-l-0">
                {
                    chosenThreadID !== undefined &&
                    <ChatThread
                        threadName={chatThreadPreviews.find(preview => preview.threadID === chosenThreadID)!.threadName}
                        loggedUserID={loggedUserID}
                        handleSendMessage={sendMessage}
                        messages={messagesForChosenThread}
                        userIDToName={userIDToNameMapForChosenThread}
                    />
                }
            </div>
        </div>
    )
}