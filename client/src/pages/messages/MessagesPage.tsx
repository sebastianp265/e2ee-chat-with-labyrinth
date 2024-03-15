import {ISessionProps} from "@/SessionCheckWrapper.tsx";
import {ConversationPreviewGetDTO, MessageGetDTO} from "@/api/types.ts";
import ConversationPreview from "@/components/app/messages/ConversationPreview.tsx";
import Conversation from "@/components/app/messages/Conversation.tsx";

export default function MessagesPage({inactivateSession}: Readonly<ISessionProps>) {
    const loggedUserId = 1
    const conversationPreviews: ConversationPreviewGetDTO[] = [
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

    const chosenConversationId = 2
    const messagesForChosenConversationId: MessageGetDTO[] = [
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
        }
        ,
        {
            id: 3,
            authorId: 2,
            content: "How you doing?"
        },
        {
            id: 4,
            authorId: 1,
            content: "Are you up? Are you up?Are you up?Are you up?Are you up?Are you up? Are you up?Are you up?"
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
        }

    ]

    return (
        <div className="flex h-full">
            <div className="flex flex-col space-y-2 border-2 p-2">
                {
                    conversationPreviews.map(conversationPreview =>
                        <ConversationPreview key={conversationPreview.conversationId}
                                             conversationPreview={conversationPreview}/>
                    )
                }
            </div>
            <div className="flex p-2 flex-grow border-2 border-l-0">
                <Conversation loggedUserId={loggedUserId} messages={messagesForChosenConversationId}/>
            </div>
        </div>
    )
}