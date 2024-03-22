import {ISessionProps} from "@/SessionCheckWrapper.tsx";
import {ConversationGetDTO, ConversationPreviewGetDTO} from "@/api/types.ts";
import ConversationPreview from "@/components/app/messages/ConversationPreview.tsx";
import Conversation from "@/components/app/messages/Conversation.tsx";
import {useEffect, useState} from "react";
import axiosAPI from "@/api/axiosAPI.ts";

export default function MessagesPage({inactivateSession}: Readonly<ISessionProps>) {
    const loggedUserIdString = localStorage.getItem(import.meta.env.VITE_USER_ID)
    const loggedUserId = loggedUserIdString != null ? parseInt(loggedUserIdString) : -1
    if (loggedUserId == -1) {
        console.error("User id info has been removed from local storage")
        inactivateSession?.()
    }

    const [conversationPreviews, setConversationPreviews] = useState<ConversationPreviewGetDTO[]>([])
    const [chosenConversationId, setChosenConversationId] = useState<number>(-1)

    useEffect(() => {
        axiosAPI.get<ConversationPreviewGetDTO[]>("/api/conversation")
            .then(response => {
                const conversationPreviews = response.data
                setConversationPreviews(conversationPreviews)
                if (conversationPreviews.length == 0) return
                setChosenConversationId(conversationPreviews[0].conversationId)
            })
            .catch(error => {
                // TODO: ERROR HANDLING
                console.error(error)
            })
    }, []);

    const [chosenConversationName, setChosenConversationName] = useState("")
    const [conversationData, setConversationData] = useState<ConversationGetDTO>({
        messages: [],
        userIdToName: {}
    })

    useEffect(() => {
        const conversationsWithChosenId =
            conversationPreviews.filter((conversationPreview =>
                conversationPreview.conversationId == chosenConversationId))
        if (conversationsWithChosenId.length != 1) {
            console.error("There should be only one conversation preview with chosen conversation id")
            return;
        }
        setConversationData({
            messages: [],
            userIdToName: {}
        })
        setChosenConversationName(conversationsWithChosenId[0].conversationName)

        axiosAPI.get<ConversationGetDTO>(`/api/conversation/${chosenConversationId}`)
            .then(response => {
                setConversationData(response.data)
            })
            .catch(error => {
                // TODO: ERROR HANDLING
                console.error(error)
            })
    }, [chosenConversationId, conversationPreviews]);

    return (
        <div className="flex h-full">
            <div className="flex flex-col space-y-2 border p-2">
                {
                    conversationPreviews.map(conversationPreview =>
                        <ConversationPreview onClick={() => setChosenConversationId(conversationPreview.conversationId)}
                                             chosenConversationId={chosenConversationId}
                                             key={conversationPreview.conversationId}
                                             conversationPreview={conversationPreview}/>
                    )
                }
            </div>
            <div className="flex p-2 flex-grow border border-l-0">
                {
                    chosenConversationId != -1 &&
                    <Conversation conversationName={chosenConversationName} loggedUserId={loggedUserId}
                                  conversationData={conversationData}/>
                }
            </div>
        </div>
    )
}