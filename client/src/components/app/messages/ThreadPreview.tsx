import {ThreadPreviewGetDTO} from "@/api/types.ts";

interface IThreadPreviewProps {
    threadPreview: ThreadPreviewGetDTO,
    chosenThreadId: number | undefined
    onClick: () => void
}

function ThreadPreview({threadPreview, onClick, chosenThreadId}: Readonly<IThreadPreviewProps>) {
    const {
        threadId,
        threadName,
        lastMessageAuthorName,
        lastMessage
    } = threadPreview

    return (
        <button onClick={onClick} className={`${chosenThreadId == threadId ? "bg-input" : "hover:bg-accent"} 
            flex flex-col border p-2 rounded-xl w-full text-left`}>
            <h3 className="font-bold text-base">{threadName}</h3>
            <span className="text-xs">{lastMessageAuthorName + ": " + lastMessage}</span>
        </button>
    );
}

export default ThreadPreview;