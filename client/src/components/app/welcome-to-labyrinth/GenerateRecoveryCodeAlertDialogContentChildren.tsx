import {useState} from "react";
import LoadingSpinnerDialogContentChildren from "@/components/app/welcome-to-labyrinth/LoadingSpinnerDialogContentChildren.tsx";
import {
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from "@/components/ui/alert-dialog.tsx";

export type HandleGenerateRecoveryCodeResponse = {
    recoveryCode: string | null;
}

export type GenerateRecoveryCodeCardContent = {
    handleGenerateRecoveryCode: () => Promise<HandleGenerateRecoveryCodeResponse>;
}

export default function GenerateRecoveryCodeAlertDialogContentChildren({handleGenerateRecoveryCode}: Readonly<GenerateRecoveryCodeCardContent>) {
    const [loading, setLoading] = useState(false);
    const [recoveryCode, setRecoveryCode] = useState<string | null>()

    if (loading) return (
        <LoadingSpinnerDialogContentChildren
            title="Generating recovery code and registering your device to the server..."
        />
    )

    if (recoveryCode !== null) return (
        <>
            <AlertDialogHeader>
                <AlertDialogTitle>Success</AlertDialogTitle>
                <AlertDialogDescription>
                    You have successfully generated recovery code. Your recovery code is: {recoveryCode}
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Close</AlertDialogCancel>
            </AlertDialogFooter>
        </>
    )

    const onGenerateRecoveryCodeClick = async () => {
        setLoading(true)
        setRecoveryCode((await handleGenerateRecoveryCode()).recoveryCode)
        setLoading(false)
    }

    return (
        <>
            <AlertDialogHeader>
                <AlertDialogTitle>Welcome to chat with secure message storage!</AlertDialogTitle>
                <AlertDialogDescription>
                    For your privacy, the app cannot view or access your stored messages.
                    To recover your message history on other devices, you must generate a
                    recovery code.
                    Keep this code safe, as it is the only way to restore your messages.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogAction onClick={onGenerateRecoveryCodeClick}>
                    Generate Recovery Code
                </AlertDialogAction>
            </AlertDialogFooter>
        </>
    )

}