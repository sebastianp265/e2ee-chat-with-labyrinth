import Messages, {MessagesWithMembersNames} from "@/components/app/messages/Messages.tsx";
import MessageInput from "@/components/app/messages/MessageInput.tsx";

export type ThreadData = {
    threadName: string,
} & MessagesWithMembersNames

export type ThreadProps = {
    loggedUserID: string,
    threadData: ThreadData,
    handleSendMessage: (messageContent: string) => void,
}

function Thread({
                    loggedUserID,
                    threadData,
                    handleSendMessage,
                }: Readonly<ThreadProps>) {
    return (
        <>
            <div className="border rounded-md w-full p-2 mb-2">
                <span className="font-bold">{threadData.threadName}</span>
            </div>
            <Messages
                messagesWithMemberNames={threadData}
                loggedUserID={loggedUserID}
            />
            <MessageInput handleSendMessage={handleSendMessage}/>
        </>
    );
}

export default Thread;