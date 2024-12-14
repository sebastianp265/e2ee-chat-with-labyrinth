import { LabyrinthLoadState } from '@/pages/messages/hooks/useLabyrinth.ts';
import ErrorDialogContentChildren from '@/components/app/welcome-to-labyrinth/ErrorDialogContentChildren.tsx';
import LoadingSpinnerDialogContentChildren from '@/components/app/welcome-to-labyrinth/LoadingSpinnerDialogContentChildren.tsx';
import RecoverSecretsDialogContentChildren, {
    HandleSubmitRecoveryCodeResponse,
} from '@/components/app/welcome-to-labyrinth/RecoverSecretsDialogContentChildren.tsx';
import GenerateRecoveryCodeAlertDialogContentChildren, {
    HandleGenerateRecoveryCodeResponse,
} from '@/components/app/welcome-to-labyrinth/GenerateRecoveryCodeAlertDialogContentChildren.tsx';
import { AxiosError } from 'axios';
import React, { useState } from 'react';

type WelcomeToLabyrinthAlertDialogContentProps = {
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

export default function WelcomeToLabyrinthAlertDialogContentChildren({
    labyrinthLoadState,
    retryInitialization,
    setLabyrinthFromFirstEpoch,
    setLabyrinthFromRecoveryCode,
}: Readonly<WelcomeToLabyrinthAlertDialogContentProps>) {
    const [error, setError] = useState<AxiosError | null>(null);

    if (error !== null) {
        let errorMessageContent: string;
        if (error.request !== undefined && error.response === undefined) {
            errorMessageContent =
                'Server is unavailable, please try again later or check your internet connection.';
        } else {
            console.error(error);
            errorMessageContent =
                'An unexpected error occurred, please contact with the administrator.';
        }

        const onTryAgainClicked = () => {
            retryInitialization().catch(setError);
        };

        return (
            <ErrorDialogContentChildren
                message={errorMessageContent}
                onTryAgainClicked={onTryAgainClicked}
            />
        );
    }

    switch (labyrinthLoadState) {
        case LabyrinthLoadState.NOT_INITIALIZED:
            return (
                <LoadingSpinnerDialogContentChildren title="Checking if you have joined Labyrinth..." />
            );
        case LabyrinthLoadState.NOT_IN_STORAGE_AND_HAS_RECOVERY_CODE:
            return (
                <RecoverSecretsDialogContentChildren
                    handleSubmitRecoveryCode={setLabyrinthFromRecoveryCode}
                    setError={setError}
                />
            );
        case LabyrinthLoadState.NOT_IN_STORAGE_AND_FIRST_EPOCH_NOT_CREATED:
            return (
                <GenerateRecoveryCodeAlertDialogContentChildren
                    handleGenerateRecoveryCode={setLabyrinthFromFirstEpoch}
                    setError={setError}
                />
            );
    }
}
