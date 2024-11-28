import RecoveryCodeForm from "@/components/app/welcome-to-labyrinth/RecoveryCodeForm.tsx";
import React, {useState} from "react";
import LoadingSpinnerDialogContentChildren
    from "@/components/app/welcome-to-labyrinth/LoadingSpinnerDialogContentChildren.tsx";
import {
    AlertDialogAction,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from "@/components/ui/alert-dialog.tsx";
import {AxiosError} from "axios";

export type HandleSubmitRecoveryCodeResponse = {
    isSuccess: boolean;
}
export type FirstLoginDialogContentProps = {
    handleSubmitRecoveryCode: (recoveryCode: string) => Promise<HandleSubmitRecoveryCodeResponse>;
    setError: React.Dispatch<React.SetStateAction<AxiosError | null>>
}

export default function RecoverSecretsDialogContentChildren({
                                                                handleSubmitRecoveryCode,
                                                                setError
                                                            }: Readonly<FirstLoginDialogContentProps>) {
    const [loading, setLoading] = useState<boolean>(false)
    const [success, setSuccess] = useState<boolean>(false)

    if (loading) return (
        <LoadingSpinnerDialogContentChildren title="Recovering your secrets..."/>
    )

    if (success) return (
        <>
            <AlertDialogHeader>
                <AlertDialogTitle>Success</AlertDialogTitle>
                <AlertDialogDescription>
                    You have successfully recovered your secrets. Enjoy secure message storage!
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogAction>Close</AlertDialogAction>
            </AlertDialogFooter>
        </>
    )

    const onRecoveryCodeSubmit = (recoveryCode: string) => {
        setLoading(true)
        handleSubmitRecoveryCode(recoveryCode)
            .then(result => {
                setSuccess(result.isSuccess)
                setLoading(false)
            })
            .catch((e: AxiosError) => {
                setSuccess(false)
                setLoading(false)
                setError(e)
            })
    }

    return (
        <>
            <AlertDialogHeader>
                <AlertDialogTitle>Welcome back!</AlertDialogTitle>
                <AlertDialogDescription>
                    It seems you have logged in on new device, please insert your
                    recovery code to recover message history.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <RecoveryCodeForm onRecoveryCodeSubmit={onRecoveryCodeSubmit}/>
        </>
    )
}
