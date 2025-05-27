import {
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog.tsx';
import { Button } from '@/components/ui/button.tsx';

export type GenerateRecoveryCodeAlertDialogContentChildrenType = {
    initializeLabyrinthFromFirstEpoch: () => void;
};

export default function GenerateRecoveryCodeAlertDialogContentChildren({
    initializeLabyrinthFromFirstEpoch,
}: Readonly<GenerateRecoveryCodeAlertDialogContentChildrenType>) {
    return (
        <>
            <AlertDialogHeader>
                <AlertDialogTitle>
                    Welcome to chat with secure message storage!
                </AlertDialogTitle>
                <AlertDialogDescription>
                    For your privacy, the app cannot view or access your stored
                    messages. To recover your message history on other devices,
                    you must generate a recovery code. Keep this code safe, as
                    it is the only way to restore your messages.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <Button onClick={initializeLabyrinthFromFirstEpoch}>
                    Generate Recovery Code
                </Button>
            </AlertDialogFooter>
        </>
    );
}
