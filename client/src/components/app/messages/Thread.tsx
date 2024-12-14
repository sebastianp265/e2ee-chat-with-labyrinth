import Messages, {MessagesWithMembersNames} from "@/components/app/messages/Messages.tsx";
import MessageInput from "@/components/app/messages/MessageInput.tsx";

export type ThreadData = {
    threadName: string,
} & MessagesWithMembersNames

export type ThreadProps = {
    loggedUserId: string,
    threadData: ThreadData,
    handleSendMessage: (messageContent: string) => void,
}

function Thread({
                    loggedUserId,
                    threadData,
                    handleSendMessage,
                }: Readonly<ThreadProps>) {
    return (
        <div className="min-h-full flex p-2 flex-grow border border-l-0 flex-col w-full">
            <div className="border rounded-md w-full p-2 mb-2">
                <span data-cy="thread-name" className="font-bold">{threadData.threadName}</span>
            </div>
            <Messages
                messagesWithMemberNames={threadData}
                loggedUserId={loggedUserId}
            />
            <MessageInput handleSendMessage={handleSendMessage}/>
        </div>
    );
}

export default Thread;