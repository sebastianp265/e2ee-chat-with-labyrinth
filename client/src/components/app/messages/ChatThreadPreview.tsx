export interface IChatThreadPreview {
    threadID: string,
    threadName: string,
    lastMessageAuthorVisibleName: string,
    lastMessage: string
}

export interface IThreadPreviewProps {
    chatThreadPreview: IChatThreadPreview,
    chosenChatThreadID: string | null
    onClick: () => void
}

function ChatThreadPreview({chatThreadPreview, onClick, chosenChatThreadID}: Readonly<IThreadPreviewProps>) {
    const {
        threadID,
        threadName,
        lastMessageAuthorVisibleName,
        lastMessage
    } = chatThreadPreview

    return (
        <button onClick={onClick} className={`${chosenChatThreadID === threadID ? "bg-input" : "hover:bg-accent"} 
            flex flex-col border p-2 rounded-xl w-full text-left`}>
            <h3 className="font-bold text-base">{threadName}</h3>
            <span className="text-xs">{lastMessageAuthorVisibleName + ": " + lastMessage}</span>
        </button>
    );
}

export default ChatThreadPreview;