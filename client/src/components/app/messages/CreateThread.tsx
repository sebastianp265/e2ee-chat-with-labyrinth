import {
    Command,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command.tsx';
import { useState } from 'react';
import { Button } from '@/components/ui/button.tsx';
import MessageInput from '@/components/app/messages/MessageInput.tsx';
import { NewChatThreadToSendPayload } from '@/pages/messages/hooks/useChatWebSocket.ts';

export type Friend = {
    userId: string;
    visibleName: string;
};

export type CreateThreadProps = {
    friends: Friend[];
    handleCreateThread: (newThread: NewChatThreadToSendPayload) => void;
};

export default function CreateThread({ friends }: Readonly<CreateThreadProps>) {
    const [open, setOpen] = useState(false);
    const [selectedFriends, setSelectedFriends] = useState<Friend[]>([]);
    const [optionClicked, setOptionClicked] = useState(false);

    const notSelectedFriends = friends.filter(
        (f) => !selectedFriends.includes(f),
    );
    // @ts-ignore
    return (
        <>
            <div>
                {selectedFriends.map((selectedFriend) => (
                    <div
                        key={selectedFriend.userId}
                        className="flex items-center gap-2"
                    >
                        <span className="">{selectedFriend.visibleName}</span>
                        <Button
                            onClick={() =>
                                setSelectedFriends((prevFriends) =>
                                    prevFriends.filter(
                                        (f) => f != selectedFriend,
                                    ),
                                )
                            }
                            size="sm"
                            className="h-auto"
                        >
                            X
                        </Button>
                    </div>
                ))}
            </div>
            <Command>
                <CommandInput
                    onFocus={() => setOpen(true)}
                    onBlur={() => {
                        if (optionClicked) {
                            setOptionClicked(false);
                        } else {
                            setOpen(false);
                        }
                    }}
                />
                <CommandList hidden={!open}>
                    {notSelectedFriends.map((friend) => (
                        <CommandItem
                            key={friend.userId}
                            onMouseDown={() => setOptionClicked(true)}
                            onSelect={() => {
                                setSelectedFriends((prevFriends) => [
                                    ...prevFriends,
                                    friend,
                                ]);
                            }}
                        >
                            <span>{friend.visibleName}</span>
                        </CommandItem>
                    ))}
                </CommandList>
            </Command>
            <MessageInput handleSendMessage={() => {}} />
        </>
    );
}
