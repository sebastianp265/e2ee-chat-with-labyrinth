import useLabyrinth, {isLabyrinthLoadState, LabyrinthLoadState} from "@/pages/messages/hooks/useLabyrinth.ts";
import ErrorDialogContentChildren from "@/components/app/welcome-to-labyrinth/ErrorDialogContentChildren.tsx";
import LoadingSpinnerDialogContentChildren
    from "@/components/app/welcome-to-labyrinth/LoadingSpinnerDialogContentChildren.tsx";
import RecoverSecretsDialogContentChildren
    from "@/components/app/welcome-to-labyrinth/RecoverSecretsDialogContentChildren.tsx";
import GenerateRecoveryCodeAlertDialogContentChildren
    from "@/components/app/welcome-to-labyrinth/GenerateRecoveryCodeAlertDialogContentChildren.tsx";
import React from "react";
import {Labyrinth} from "@/lib/labyrinth/Labyrinth.ts";

type WelcomeToLabyrinthAlertDialogContentProps = {
    loggedUserID: string,
    setLabyrinth: React.Dispatch<React.SetStateAction<Labyrinth | null>>,
}

export default function WelcomeToLabyrinthAlertDialogContentChildren({
                                                                         loggedUserID,
                                                                         setLabyrinth,
                                                                     }: WelcomeToLabyrinthAlertDialogContentProps) {
    const {
        labyrinthOrLoadState,
        retryInitialization,
        error,
        setLabyrinthFromRecoveryCode,
        setLabyrinthFromFirstEpoch
    } = useLabyrinth(loggedUserID)

    if (error !== null) {
        let errorMessageContent: string
        if (error.request !== undefined && error.response === undefined) {
            errorMessageContent = "Server is unavailable, please try again later or check your internet connection."
        } else {
            errorMessageContent = "An unexpected error occurred, please contact with the administrator."
        }

        return (
            <ErrorDialogContentChildren
                message={errorMessageContent}
                onTryAgainClicked={retryInitialization}
            />
        )
    }

    if (isLabyrinthLoadState(labyrinthOrLoadState)) {
        switch (labyrinthOrLoadState) {
            case LabyrinthLoadState.NOT_INITIALIZED:
                return (
                    <LoadingSpinnerDialogContentChildren
                        title="Checking if you have joined Labyrinth..."
                    />
                )
            case LabyrinthLoadState.NOT_IN_STORAGE_AND_HAS_RECOVERY_CODE:
                return (
                    <RecoverSecretsDialogContentChildren
                        handleSubmitRecoveryCode={setLabyrinthFromRecoveryCode}
                    />
                )
            case LabyrinthLoadState.NOT_IN_STORAGE_AND_FIRST_EPOCH_NOT_CREATED:
                return (
                    <GenerateRecoveryCodeAlertDialogContentChildren
                        handleGenerateRecoveryCode={setLabyrinthFromFirstEpoch}
                    />
                )
        }
    }

    setLabyrinth(labyrinthOrLoadState)

    return (
        <></>
    )
}