export type ThreadPreviewData = {
    threadID: string,
    threadName: string,
    lastMessageAuthorVisibleName: string | null,
    lastMessage: string | null,
}

export interface ThreadPreviewProps {
    threadPreviewData: ThreadPreviewData,

    chosenThreadID: string | null,
    onClick: () => void,
}

function ThreadPreview({threadPreviewData, onClick, chosenThreadID}: Readonly<ThreadPreviewProps>) {
    return (
        <button onClick={onClick}
                className={`${chosenThreadID === threadPreviewData.threadID ? "bg-input" : "hover:bg-accent"} 
            flex flex-col border p-2 rounded-xl w-full text-left`}>
            <h3 className="font-bold text-base">{threadPreviewData.threadName}</h3>
            {
                <span
                    className="text-xs">{threadPreviewData.lastMessageAuthorVisibleName + ": " + threadPreviewData.lastMessage}
                </span>
            }
        </button>
    );
}

export default ThreadPreview;