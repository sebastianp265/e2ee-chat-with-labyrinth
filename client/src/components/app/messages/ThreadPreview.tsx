export type ThreadPreviewDTO = {
    threadID: string,
    threadName: string,
    lastMessageAuthorVisibleName: string,
    lastMessage: string
}

interface ThreadPreviewProps {
    threadPreview: ThreadPreviewDTO,
    chosenThreadId: string | undefined
    onClick: () => void
}

function ThreadPreview({threadPreview, onClick, chosenThreadId}: Readonly<ThreadPreviewProps>) {
    const {
        threadID,
        threadName,
        lastMessageAuthorVisibleName,
        lastMessage
    } = threadPreview

    return (
        <button onClick={onClick} className={`${chosenThreadId === threadID ? "bg-input" : "hover:bg-accent"} 
            flex flex-col border p-2 rounded-xl w-full text-left`}>
            <h3 className="font-bold text-base">{threadName}</h3>
            <span className="text-xs">{lastMessageAuthorVisibleName + ": " + lastMessage}</span>
        </button>
    );
}

export default ThreadPreview;