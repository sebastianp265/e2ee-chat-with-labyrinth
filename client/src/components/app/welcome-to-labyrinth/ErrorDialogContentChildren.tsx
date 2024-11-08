import {
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from "@/components/ui/alert-dialog.tsx";
import {Button} from "@/components/ui/button.tsx";

type ErrorDialogContentProps = {
    message: string,
    onTryAgainClicked: () => Promise<void>,
}

export default function ErrorDialogContentChildren({
                                                       message,
                                                       onTryAgainClicked
                                                   }: Readonly<ErrorDialogContentProps>) {

    return (
        <>
            <AlertDialogHeader>
                <AlertDialogTitle>
                    Oops! An error occurred during first initialization on device
                </AlertDialogTitle>
                <AlertDialogDescription>
                    {message}
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <Button onClick={onTryAgainClicked}>
                    Try again
                </Button>
            </AlertDialogFooter>
        </>
    )
}