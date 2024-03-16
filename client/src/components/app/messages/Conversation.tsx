import {MessageGetDTO} from "@/api/types.ts";
import {Textarea} from "@/components/ui/textarea.tsx";
import {Button} from "@/components/ui/button.tsx";
import {useEffect, useState} from "react";

interface IConversationProps {
    loggedUserId: number,
    conversationId: number | undefined,
    conversationName: string | undefined
    messages: MessageGetDTO[]
}

function Conversation({conversationId, loggedUserId, messages, conversationName}: Readonly<IConversationProps>) {
    const [chatMemberIdToName, setChatMemberIdToName] = useState<{
        [memberId: number]: string
    }>({})
    useEffect(() => {
        if (conversationId == 2) {
            setChatMemberIdToName({
                1: "You",
                2: "Jack Sparrow"
            })
        } else {
            setChatMemberIdToName({})
        }
    }, [conversationId]);

    return (
        <div className="flex flex-col w-full">
            <div className="border rounded-md
                w-full p-2 mb-2">
                <span className="font-bold">{conversationName}</span>
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
                                        <span className="text-xs">{chatMemberIdToName[message.authorId]}: </span>
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
                <Textarea className="resize-none min-h-0">
                </Textarea>
                <Button className="mt-auto mb-auto">
                    Submit
                </Button>
            </div>
        </div>
    );
}

export default Conversation;