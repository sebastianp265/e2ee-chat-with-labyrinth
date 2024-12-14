import {
    AlertDialog,
    AlertDialogContent,
} from '@/components/ui/alert-dialog.tsx';
import WelcomeToLabyrinthAlertDialogContentChildren from '@/pages/messages/WelcomeToLabyrinthAlertDialogContentChildren.tsx';
import { LabyrinthLoadState } from '@/pages/messages/hooks/useLabyrinth.ts';
import { HandleGenerateRecoveryCodeResponse } from '@/components/app/welcome-to-labyrinth/GenerateRecoveryCodeAlertDialogContentChildren.tsx';
import { HandleSubmitRecoveryCodeResponse } from '@/components/app/welcome-to-labyrinth/RecoverSecretsDialogContentChildren.tsx';
import React from 'react';

export type WelcomeToLabyrinthProps = {
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    labyrinthLoadState:
        | LabyrinthLoadState.NOT_INITIALIZED
        | LabyrinthLoadState.NOT_IN_STORAGE_AND_FIRST_EPOCH_NOT_CREATED
        | LabyrinthLoadState.NOT_IN_STORAGE_AND_HAS_RECOVERY_CODE;
    retryInitialization: () => Promise<void>;
    setLabyrinthFromFirstEpoch: () => Promise<HandleGenerateRecoveryCodeResponse>;
    setLabyrinthFromRecoveryCode: (
        recoveryCode: string,
    ) => Promise<HandleSubmitRecoveryCodeResponse>;
};

export default function WelcomeToLabyrinthAlertDialog({
    open,
    setOpen,
    labyrinthLoadState,
    retryInitialization,
    setLabyrinthFromFirstEpoch,
    setLabyrinthFromRecoveryCode,
}: Readonly<WelcomeToLabyrinthProps>) {
    return (
        <AlertDialog open={open} onOpenChange={(o) => setOpen(o)}>
            <AlertDialogContent>
                <WelcomeToLabyrinthAlertDialogContentChildren
                    setOpen={setOpen}
                    labyrinthLoadState={labyrinthLoadState}
                    retryInitialization={retryInitialization}
                    setLabyrinthFromFirstEpoch={setLabyrinthFromFirstEpoch}
                    setLabyrinthFromRecoveryCode={setLabyrinthFromRecoveryCode}
                />
            </AlertDialogContent>
        </AlertDialog>
    );
}
