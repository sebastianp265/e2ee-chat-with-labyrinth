import ErrorDialogContentChildren from '@/components/app/welcome-to-labyrinth/ErrorDialogContentChildren.tsx';
import LoadingSpinnerDialogContentChildren from '@/components/app/welcome-to-labyrinth/LoadingSpinnerDialogContentChildren.tsx';
import RecoverSecretsDialogContentChildren, {
    RecoverSecretsDialogContentChildrenType as RecoverSecretsDialogContentChildrenProps,
} from '@/components/app/welcome-to-labyrinth/RecoverSecretsDialogContentChildren.tsx';
import GenerateRecoveryCodeAlertDialogContentChildren, {
    GenerateRecoveryCodeAlertDialogContentChildrenType as GenerateRecoveryCodeAlertDialogContentChildrenProps,
} from '@/components/app/welcome-to-labyrinth/GenerateRecoveryCodeAlertDialogContentChildren.tsx';
import { LabyrinthHookState, LabyrinthStatus } from './hooks/useLabyrinth';
import WelcomeToLabyrinthSuccessDialog from '@/components/app/welcome-to-labyrinth/WelcomeToLabyrinthSuccessDialog';

export type WelcomeToLabyrinthAlertDialogContentProps = {
    labyrinthHookState: LabyrinthHookState;
    retryInitialization: () => void;
} & RecoverSecretsDialogContentChildrenProps &
    GenerateRecoveryCodeAlertDialogContentChildrenProps;

export default function WelcomeToLabyrinthAlertDialogContentChildren({
    labyrinthHookState,
    retryInitialization,
    initializeLabyrinthFromFirstEpoch,
    initializeLabyrinthFromRecoveryCode,
}: Readonly<WelcomeToLabyrinthAlertDialogContentProps>) {

    switch (labyrinthHookState.status) {
        case LabyrinthStatus.ERROR:
            return (
                <ErrorDialogContentChildren
                    message={labyrinthHookState.error.userFriendlyMessage}
                    onTryAgainClicked={retryInitialization}
                />
            );

        case LabyrinthStatus.AWAITING_FIRST_EPOCH_CREATION:
            return (
                <GenerateRecoveryCodeAlertDialogContentChildren
                    initializeLabyrinthFromFirstEpoch={
                        initializeLabyrinthFromFirstEpoch
                    }
                />
            );
        case LabyrinthStatus.CREATING_FIRST_EPOCH:
            return (
                <LoadingSpinnerDialogContentChildren title="Generating recovery code and registering your device to the server..." />
            );
        case LabyrinthStatus.SUCCESS_FIRST_EPOCH_CREATION:
            return (
                <WelcomeToLabyrinthSuccessDialog
                    description={`You have successfully generated recovery code. Your recovery code is: ${labyrinthHookState.recoveryCode}`}
                />
            );

        case LabyrinthStatus.AWAITING_RECOVERY_CODE:
            return (
                <RecoverSecretsDialogContentChildren
                    initializeLabyrinthFromRecoveryCode={
                        initializeLabyrinthFromRecoveryCode
                    }
                />
            );
        case LabyrinthStatus.PROCESSING_RECOVERY_CODE:
            return (
                <LoadingSpinnerDialogContentChildren title="Recovering your secrets..." />
            );
        case LabyrinthStatus.SUCCESS_RECOVERY_CODE_PROCESSED:
            return (
                <WelcomeToLabyrinthSuccessDialog description="You have successfully recovered your secrets. Enjoy secure message storage!" />
            );
    }
}
