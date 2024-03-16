import {ISessionProps} from "@/SessionCheckWrapper.tsx";
import {ConversationPreviewGetDTO, MessageGetDTO} from "@/api/types.ts";
import ConversationPreview from "@/components/app/messages/ConversationPreview.tsx";
import Conversation from "@/components/app/messages/Conversation.tsx";
import {useEffect, useState} from "react";

export default function MessagesPage({inactivateSession}: Readonly<ISessionProps>) {
    const loggedUserId = 1
    const [conversationPreviews, setConversationPreviews] = useState<ConversationPreviewGetDTO[]>([])
    const [chosenConversationId, setChosenConversationId] = useState<number | undefined>(undefined)
    const [chosenConversationName, setChosenConversationName] = useState<string | undefined>(undefined)

    useEffect(() => {
        const conversationPreviewsFromAPI = [
            {
                conversationId: 1,
                conversationName: "Christopher Bear",
                lastMessage: "Hello",
                lastMessageAuthorName: "Christopher Bear"
            },
            {
                conversationId: 2,
                conversationName: "Jack Sparrow",
                lastMessage: "Are you up?",
                lastMessageAuthorName: "You"
            },
            {
                conversationId: 3,
                conversationName: "John Snow",
                lastMessage: "Winter is coming",
                lastMessageAuthorName: "John Snow"
            }
        ]

        setConversationPreviews(conversationPreviewsFromAPI)
        if (conversationPreviewsFromAPI.length > 0) {
            const firstConversationPreview = conversationPreviewsFromAPI[0]
            setChosenConversationId(firstConversationPreview.conversationId)
        }
    }, []);

    const [messagesForChosenConversationId, setMessagesForChosenConversationId] = useState<MessageGetDTO[]>([])

    useEffect(() => {
        const conversationsWithChosenId = conversationPreviews.filter(
            (conversationPreview => conversationPreview.conversationId == chosenConversationId))
        if(conversationsWithChosenId.length == 0) return
        setChosenConversationName(conversationsWithChosenId[0].conversationName)
        if (chosenConversationId == 2) {
            const messagesForChosenConversationIdFromAPI: MessageGetDTO[] = [
                {
                    id: 1,
                    authorId: 2,
                    content: "Hi!"
                },
                {
                    id: 2,
                    authorId: 1,
                    content: "Hello man"
                },
                {
                    id: 3,
                    authorId: 2,
                    content: "How you doing?"
                },
                {
                    id: 4,
                    authorId: 1,
                    content: "Are you up?"
                },
                {
                    id: 5,
                    authorId: 1,
                    content: "I got invitation for a party"
                }
            ]
            setMessagesForChosenConversationId(messagesForChosenConversationIdFromAPI)
        } else {
            setMessagesForChosenConversationId([])
        }
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
                <Conversation conversationName={chosenConversationName} loggedUserId={loggedUserId}
                              conversationId={chosenConversationId} messages={messagesForChosenConversationId}/>
            </div>
        </div>
    )
}