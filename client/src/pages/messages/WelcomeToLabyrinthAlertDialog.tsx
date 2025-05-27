import {
    AlertDialog,
    AlertDialogContent,
} from '@/components/ui/alert-dialog.tsx';
import WelcomeToLabyrinthAlertDialogContentChildren, {
    WelcomeToLabyrinthAlertDialogContentProps,
} from '@/pages/messages/WelcomeToLabyrinthAlertDialogContentChildren.tsx';
import React, { useEffect } from 'react';
import { LabyrinthStatus } from './hooks/useLabyrinth';

export type WelcomeToLabyrinthAlertDialogProps = {
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    finishInitializationFromDialog: () => void;
} & WelcomeToLabyrinthAlertDialogContentProps;

export default function WelcomeToLabyrinthAlertDialog({
    open,
    setOpen,
    labyrinthHookState,
    retryInitialization,
    finishInitializationFromDialog,
    initializeLabyrinthFromFirstEpoch,
    initializeLabyrinthFromRecoveryCode,
}: Readonly<WelcomeToLabyrinthAlertDialogProps>) {
    useEffect(() => {
        if (
            labyrinthHookState.status === LabyrinthStatus.INITIAL_LOADING ||
            labyrinthHookState.status === LabyrinthStatus.READY_TO_USE_LABYRINTH
        ) {
            setOpen(false);
        } else {
            setOpen(true);
        }
    }, [labyrinthHookState.status, setOpen]);

    return (
        <AlertDialog
            open={open}
            onOpenChange={(o) => {
                if (!o) {
                    const isSetupInProgressOrSuccessfulAndAwaitingDialogClose = [
                        LabyrinthStatus.AWAITING_FIRST_EPOCH_CREATION,
                        LabyrinthStatus.CREATING_FIRST_EPOCH,
                        LabyrinthStatus.SUCCESS_FIRST_EPOCH_CREATION,
                        LabyrinthStatus.AWAITING_RECOVERY_CODE,
                        LabyrinthStatus.PROCESSING_RECOVERY_CODE,
                        LabyrinthStatus.SUCCESS_RECOVERY_CODE_PROCESSED,
                    ].includes(labyrinthHookState.status);

                    if (isSetupInProgressOrSuccessfulAndAwaitingDialogClose) {
                        finishInitializationFromDialog();
                    }
                }
                setOpen(o);
            }}
        >
            <AlertDialogContent>
                <WelcomeToLabyrinthAlertDialogContentChildren
                    labyrinthHookState={labyrinthHookState}
                    retryInitialization={retryInitialization}
                    initializeLabyrinthFromFirstEpoch={
                        initializeLabyrinthFromFirstEpoch
                    }
                    initializeLabyrinthFromRecoveryCode={
                        initializeLabyrinthFromRecoveryCode
                    }
                />
            </AlertDialogContent>
        </AlertDialog>
    );
}
