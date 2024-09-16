import {Textarea} from "@/components/ui/textarea.tsx";
import {Button} from "@/components/ui/button.tsx";
import {ChangeEvent, useState} from "react";

interface IThreadProps {
    threadName: string
    loggedUserId: number
    messages: MessageGetDTO[]
    userIdToName: UserIdToName
    handleSendMessage: (messageContent: string) => void
}

function Thread({
                          threadName,
                          loggedUserId,
                          messages,
                          userIdToName,
                          handleSendMessage
                      }: Readonly<IThreadProps>) {
    const [messageToSend, setMessageToSend] = useState("")

    const handleMessageToSendChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
        setMessageToSend(event.target.value)
    }

    const onSendMessage = () => {
        handleSendMessage(messageToSend)
    }

    return (
        <div className="flex flex-col w-full">
            <div className="border rounded-md w-full p-2 mb-2">
                <span className="font-bold">{threadName}</span>
            </div>
            <div className="flex flex-col space-y-1 border rounded-md
                w-full max-h-screen overflow-y-auto p-2 flex-grow">
                {
                    messages.map((message, index) => {
                        const isAuthorALoggedUser = message.authorId === loggedUserId
                        return (
                            <div key={message.id}
                                 className={`${isAuthorALoggedUser ?
                                     "place-self-end"
                                     : "place-self-start"} max-w-[50%]`}>
                                <div className="flex flex-col">
                                    {
                                        (!isAuthorALoggedUser && (index == 0 || message.authorId != messages[index - 1].authorId)) &&
                                        <span className="text-xs">{userIdToName[message.authorId]}: </span>
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
            <div className="flex space-x-2 mt-2">
                <Textarea
                    value={messageToSend}
                    onChange={handleMessageToSendChange}
                    className="resize-none min-h-0">
                </Textarea>
                <Button onClick={onSendMessage} className="mt-auto mb-auto">
                    Send
                </Button>
            </div>
        </div>
    );
}

export default Thread;