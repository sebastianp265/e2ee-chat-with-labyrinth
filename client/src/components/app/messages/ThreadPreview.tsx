export type ThreadPreviewData = {
    threadId: string,
    threadName: string,
    lastMessageAuthorVisibleName: string,
    lastMessage: string,
}

export interface ThreadPreviewProps {
    threadPreviewData: ThreadPreviewData,

    chosenThreadId: string | null,
    onClick: () => void,
}

function ThreadPreview({threadPreviewData, onClick, chosenThreadId}: Readonly<ThreadPreviewProps>) {
    const {threadId, threadName, lastMessageAuthorVisibleName, lastMessage} = threadPreviewData

    return (
        <button
            onClick={onClick}
            className={`${chosenThreadId === threadId ? "bg-input" : "hover:bg-accent"} 
            flex flex-col border p-2 rounded-xl w-full text-left`}
        >
            <h3 className="font-bold text-base">{threadName}</h3>
            <span
                className="text-xs"
            >
                {
                    lastMessageAuthorVisibleName + ": " + lastMessage
                }
            </span>
        </button>
    )
}

export default ThreadPreview;