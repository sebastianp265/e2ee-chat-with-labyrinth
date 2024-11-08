export type Message = {
    id: string,
    authorID: string,
    content: string,
    timestamp: number,
}

export type MessagesWithMembersNames = {
    messages: Message[];
    membersVisibleNameByUserID: {
        [userID: string]: string,
    },
}

export type MessagesProps = {
    messagesWithMemberNames: MessagesWithMembersNames
    loggedUserID: string;
}

export default function Messages({messagesWithMemberNames, loggedUserID}: Readonly<MessagesProps>) {
    const {messages, membersVisibleNameByUserID} = messagesWithMemberNames

    return (
        <div className="flex flex-col space-y-1 border rounded-md
                w-full max-h-screen overflow-y-auto p-2 flex-grow">
            {
                messages.map((message, index) => {
                    const isAuthorALoggedUser = message.authorID === loggedUserID
                    return (
                        <div key={message.id}
                             className={`${isAuthorALoggedUser ?
                                 "place-self-end"
                                 : "place-self-start"} max-w-[50%]`}>
                            <div className="flex flecx-col">
                                {
                                    (!isAuthorALoggedUser && (index == 0 || message.authorID != messages[index - 1].authorID)) &&
                                    <span
                                        className="text-xs">{membersVisibleNameByUserID[message.authorID]}: </span>
                                }
                                <span className={`${isAuthorALoggedUser ?
                                    "bg-primary text-primary-foreground" : "bg-accent"
                                } p-2 w-fit rounded-xl`}>{message.content}</span>
                            </div>
                        </div>
                    )
                })
            }
        </div>
    )
}