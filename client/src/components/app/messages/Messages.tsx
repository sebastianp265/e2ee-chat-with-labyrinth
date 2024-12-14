export type Message = {
    id: string;
    authorId: string;
    content: string;
    timestamp: number;
};

export type MessagesWithMembersNames = {
    messages: Message[];
    membersVisibleNameByUserId: {
        [userId: string]: string;
    };
};

export type MessagesProps = {
    messagesWithMemberNames: MessagesWithMembersNames;
    loggedUserId: string;
};

export default function Messages({
    messagesWithMemberNames,
    loggedUserId,
}: Readonly<MessagesProps>) {
    const { messages, membersVisibleNameByUserId } = messagesWithMemberNames;

    return (
        <div
            data-cy="messages"
            className="flex h-full flex-col space-y-1 border rounded-md
                w-full max-h-screen overflow-y-auto p-2 flex-grow"
        >
            {messages.map((message, index) => {
                const isAuthorALoggedUser = message.authorId === loggedUserId;
                return (
                    <div
                        key={message.id}
                        className={`${
                            isAuthorALoggedUser
                                ? 'place-self-end'
                                : 'place-self-start'
                        } max-w-[50%]`}
                    >
                        <div className="flex flex-col">
                            {!isAuthorALoggedUser &&
                                (index == 0 ||
                                    message.authorId !=
                                        messages[index - 1].authorId) && (
                                    <span className="text-xs">
                                        {
                                            membersVisibleNameByUserId[
                                                message.authorId
                                            ]
                                        }
                                        :{' '}
                                    </span>
                                )}
                            <span
                                className={`${
                                    isAuthorALoggedUser
                                        ? 'bg-primary text-primary-foreground'
                                        : 'bg-accent'
                                } p-2 w-fit rounded-xl`}
                            >
                                {message.content}
                            </span>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
