import {ConversationPreviewGetDTO} from "@/api/types.ts";

interface IConversationPreviewProps {
    conversationPreview: ConversationPreviewGetDTO,
    chosenConversationId: number | undefined
    onClick: () => void
}

function ConversationPreview({conversationPreview, onClick, chosenConversationId}: Readonly<IConversationPreviewProps>) {
    const {
        conversationId,
        conversationName,
        lastMessageAuthorName,
        lastMessage
    } = conversationPreview

    return (
        <button onClick={onClick} className={`${chosenConversationId == conversationId ? "bg-input" : "hover:bg-accent"} 
            flex flex-col border p-2 rounded-xl w-full text-left`}>
            <h3 className="font-bold text-base">{conversationName}</h3>
            <span className="text-xs">{lastMessageAuthorName + ": " + lastMessage}</span>
        </button>
    );
}

export default ConversationPreview;