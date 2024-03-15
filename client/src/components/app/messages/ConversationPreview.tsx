import {ConversationPreviewGetDTO} from "@/api/types.ts";

interface IConversationPreviewProps {
    conversationPreview: ConversationPreviewGetDTO,
}

function ConversationPreview({conversationPreview}: Readonly<IConversationPreviewProps>) {
    const {conversationId,
        conversationName,
        lastMessageAuthorName,
        lastMessage
    } = conversationPreview

    return (
        <div className="flex flex-col border-2 p-2 rounded-xl w-full">
            <h3 className="font-bold text-base">{conversationName}</h3>
            <span className="text-xs">{lastMessageAuthorName + ": " + lastMessage}</span>
        </div>
    );
}

export default ConversationPreview;