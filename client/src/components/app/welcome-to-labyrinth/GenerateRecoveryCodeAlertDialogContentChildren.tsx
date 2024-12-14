import React, { useState } from 'react';
import LoadingSpinnerDialogContentChildren from '@/components/app/welcome-to-labyrinth/LoadingSpinnerDialogContentChildren.tsx';
import {
    AlertDialogCancel,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog.tsx';
import { Button } from '@/components/ui/button.tsx';
import { AxiosError } from 'axios';

export type HandleGenerateRecoveryCodeResponse = {
    recoveryCode: string | null;
};

export type GenerateRecoveryCodeCardContent = {
    handleGenerateRecoveryCode: () => Promise<HandleGenerateRecoveryCodeResponse>;
    setError: React.Dispatch<React.SetStateAction<AxiosError | null>>;
};

export default function GenerateRecoveryCodeAlertDialogContentChildren({
    handleGenerateRecoveryCode,
    setError,
}: Readonly<GenerateRecoveryCodeCardContent>) {
    const [loading, setLoading] = useState(false);
    const [recoveryCode, setRecoveryCode] = useState<string | null>(null);

    if (loading)
        return (
            <LoadingSpinnerDialogContentChildren title="Generating recovery code and registering your device to the server..." />
        );

    if (recoveryCode !== null)
        return (
            <>
                <AlertDialogHeader>
                    <AlertDialogTitle>Success</AlertDialogTitle>
                    <AlertDialogDescription>
                        You have successfully generated recovery code. Your
                        recovery code is: {recoveryCode}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Close</AlertDialogCancel>
                </AlertDialogFooter>
            </>
        );

    const onGenerateRecoveryCodeClick = () => {
        setLoading(true);

        handleGenerateRecoveryCode()
            .then((result) => {
                setRecoveryCode(result.recoveryCode);
                setLoading(false);
            })
            .catch((e: AxiosError) => {
                setError(e);
                setLoading(false);
            });
    };

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
                <Button onClick={onGenerateRecoveryCodeClick}>
                    Generate Recovery Code
                </Button>
            </AlertDialogFooter>
        </>
    );
}
