import { Textarea } from '@/components/ui/textarea.tsx';
import { Button } from '@/components/ui/button.tsx';
import { ChangeEvent, useState } from 'react';

export type MessageInputProps = {
    handleSendMessage: (message: string) => void;
};

export default function MessageInput({
    handleSendMessage,
}: Readonly<MessageInputProps>) {
    const [messageToSend, setMessageToSend] = useState('');

    const handleMessageToSendChange = (
        event: ChangeEvent<HTMLTextAreaElement>,
    ) => {
        setMessageToSend(event.target.value);
    };

    const onSendMessage = () => {
        handleSendMessage(messageToSend);
        setMessageToSend('');
    };
    return (
        <div data-cy="message-input" className="flex space-x-2 mt-2">
            <Textarea
                value={messageToSend}
                onChange={handleMessageToSendChange}
                className="resize-none min-h-0"
            ></Textarea>
            <Button onClick={onSendMessage} className="mt-auto mb-auto">
                Send
            </Button>
        </div>
    );
}
