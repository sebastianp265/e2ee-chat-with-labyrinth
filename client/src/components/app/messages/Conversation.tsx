import {MessageGetDTO} from "@/api/types.ts";
import {Textarea} from "@/components/ui/textarea.tsx";
import {Button} from "@/components/ui/button.tsx";

interface IConversationProps {
    loggedUserId: number,
    messages: MessageGetDTO[]
}

function Conversation({loggedUserId, messages}: Readonly<IConversationProps>) {

    return (
        <div className="flex flex-col w-full">
            <div className="flex flex-col space-y-2 border-2 rounded-md
            w-full max-h-screen overflow-y-auto p-2">
                {
                    messages.map(message => {
                        return (
                            <div key={message.id} className={`${message.authorId === loggedUserId ?
                                "place-self-end" : "place-self-start"
                            } border-2 rounded-xl w-fit p-2 max-w-[50%]`}>
                                <span>{message.content}</span>
                            </div>
                        )
                    })
                }
            </div>
            <div className="flex space-x-2">
                <Textarea className="mt-2 resize-none min-h-0">
                    Halo
                </Textarea>
                <Button className="mt-auto mb-auto">
                    Submit
                </Button>
            </div>

        </div>
    );
}

export default Conversation;