import {Command, CommandInput, CommandItem, CommandList} from "@/components/ui/command.tsx";
import {useState} from "react";
import {Button} from "@/components/ui/button.tsx";
import MessageInput from "@/components/app/messages/MessageInput.tsx";
import {NewThreadToSend} from "@/api/socket-types.ts";

export type Friend = {
    userID: string,
    visibleName: string,
}

export type CreateThreadProps = {
    friends: Friend[],
    handleCreateThread: (newThread: NewThreadToSend) => void,
}

export default function CreateThread({friends, handleCreateThread}: Readonly<CreateThreadProps>) {
    const [isCommandListHidden, setIsCommandListHidden] = useState(false);

    const [selectedFriends, setSelectedFriends] = useState<Friend[]>([]);

    return (
        <>
            <div>
                {
                    selectedFriends.map(selectedFriend =>
                        <div key={selectedFriend.userID}>
                            <span>{selectedFriend.visibleName}</span>
                            <Button>x</Button>
                        </div>
                    )
                }
            </div>
            <Command>
                <CommandInput onFocus={() => setIsCommandListHidden(true)}
                              onBlur={() => setIsCommandListHidden(false)}/>
                <CommandList hidden={isCommandListHidden}>
                    {
                        friends.filter(f => !selectedFriends.includes(f)).map(friend =>
                            <CommandItem key={friend.userID} onClick={() => {
                                setSelectedFriends(prevFriends => [...prevFriends, friend])
                            }}>
                                <span>{friend.visibleName}</span>
                            </CommandItem>
                        )
                    }
                </CommandList>
            </Command>
            <MessageInput handleSendMessage={(messageContent: string) => handleCreateThread({
                messageContent,
                memberUserIDs: selectedFriends.map(f => f.userID)
            })}/>
        </>
    );
}