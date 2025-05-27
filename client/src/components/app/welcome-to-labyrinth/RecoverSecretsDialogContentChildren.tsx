import RecoveryCodeForm from '@/components/app/welcome-to-labyrinth/RecoveryCodeForm.tsx';
import {
    AlertDialogDescription,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog.tsx';

export type RecoverSecretsDialogContentChildrenType = {
    initializeLabyrinthFromRecoveryCode: (recoveryCode: string) => void;
};

export default function RecoverSecretsDialogContentChildren({
    initializeLabyrinthFromRecoveryCode,
}: Readonly<RecoverSecretsDialogContentChildrenType>) {
    return (
        <>
            <AlertDialogHeader>
                <AlertDialogTitle>Welcome back!</AlertDialogTitle>
                <AlertDialogDescription>
                    It seems you have logged in on new device, please insert
                    your recovery code to recover message history.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <RecoveryCodeForm
                onRecoveryCodeSubmit={initializeLabyrinthFromRecoveryCode}
            />
        </>
    );
}
