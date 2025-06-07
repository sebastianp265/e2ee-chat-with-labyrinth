import GenericDialogContent from '@/components/app/welcome-to-labyrinth/GenericDialogContent.tsx';
import { Button } from '@/components/ui/button.tsx';
import { LabyrinthHookState, LabyrinthStatus } from './hooks/useLabyrinth';
import RecoveryCodeDialogContent from '@/components/app/welcome-to-labyrinth/RecoveryCodeDialogContent';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useSessionContext } from '@/SessionCheckWrapper.tsx';

export type WelcomeToLabyrinthDialogContentProps = {
    labyrinthHookState: LabyrinthHookState;
    retryInitialization: () => void;
    initializeLabyrinthFromFirstEpoch: () => void;
    initializeLabyrinthFromRecoveryCode: (recoveryCode: string) => void;
    finishInitializationFromDialog: () => void;
    handleLogout: () => void;
};

export default function WelcomeToLabyrinthDialogContentChildren({
    labyrinthHookState,
    retryInitialization,
    initializeLabyrinthFromFirstEpoch,
    initializeLabyrinthFromRecoveryCode,
    finishInitializationFromDialog,
    handleLogout,
}: Readonly<WelcomeToLabyrinthDialogContentProps>) {
    const { inactivateSession } = useSessionContext();

    switch (labyrinthHookState.status) {
        case LabyrinthStatus.ERROR:
            if (labyrinthHookState.error.statusCode === 401) {
                inactivateSession();
            }
            return (
                <GenericDialogContent
                    title="Oops! An error occurred."
                    description={labyrinthHookState.error.userFriendlyMessage}
                    footer={
                        <>
                            <Button onClick={handleLogout}>Logout</Button>
                            <Button onClick={retryInitialization}>
                                Try Again
                            </Button>
                        </>
                    }
                />
            );
        case LabyrinthStatus.CREATING_FIRST_EPOCH:
        case LabyrinthStatus.PROCESSING_RECOVERY_CODE:
            return (
                <GenericDialogContent
                    description={
                        <div className="flex items-center justify-center gap-2">
                            <LoadingSpinner />
                            Loading...
                        </div>
                    }
                />
            );

        case LabyrinthStatus.AWAITING_FIRST_EPOCH_CREATION:
            return (
                <GenericDialogContent
                    title="Welcome to chat with secure message storage!"
                    description="For your privacy, the app cannot view or access your stored
                    messages. To recover your message history on other devices,
                    you must generate a recovery code. Keep this code safe, as
                    it is the only way to restore your messages."
                    footer={
                        <Button onClick={initializeLabyrinthFromFirstEpoch}>
                            Generate Recovery Code
                        </Button>
                    }
                />
            );
        case LabyrinthStatus.SUCCESS_FIRST_EPOCH_CREATION:
            return (
                <GenericDialogContent
                    title="Success!"
                    description={`You have successfully generated recovery code. Your recovery code is: ${labyrinthHookState.recoveryCode}`}
                    footer={
                        <Button onClick={finishInitializationFromDialog}>
                            Close
                        </Button>
                    }
                />
            );

        case LabyrinthStatus.AWAITING_RECOVERY_CODE: {
            return (
                <RecoveryCodeDialogContent
                    onRecoveryCodeSubmit={initializeLabyrinthFromRecoveryCode}
                />
            );
        }
        case LabyrinthStatus.SUCCESS_RECOVERY_CODE_PROCESSED:
            return (
                <GenericDialogContent
                    title="Success!"
                    description="You have successfully recovered your secrets. Enjoy secure message storage!"
                    footer={
                        <Button onClick={finishInitializationFromDialog}>
                            Close
                        </Button>
                    }
                />
            );

        default:
            return null;
    }
}
