import RecoveryCodeForm from "@/components/app/welcome-to-labyrinth/RecoveryCodeForm.tsx";
import {useState} from "react";
import LoadingSpinnerDialogContentChildren
    from "@/components/app/welcome-to-labyrinth/LoadingSpinnerDialogContentChildren.tsx";
import {
    AlertDialogAction,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from "@/components/ui/alert-dialog.tsx";

export type HandleSubmitRecoveryCodeResponse = {
    isSuccess: boolean;
}
export type FirstLoginDialogContentProps = {
    handleSubmitRecoveryCode: (recoveryCode: string) => Promise<HandleSubmitRecoveryCodeResponse>;
}

export default function RecoverSecretsDialogContentChildren({handleSubmitRecoveryCode}: Readonly<FirstLoginDialogContentProps>) {
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

    const onRecoveryCodeSubmit = async (recoveryCode: string) => {
        setLoading(true)
        const {isSuccess} = await handleSubmitRecoveryCode(recoveryCode)
        setSuccess(isSuccess)
        setLoading(false)
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
