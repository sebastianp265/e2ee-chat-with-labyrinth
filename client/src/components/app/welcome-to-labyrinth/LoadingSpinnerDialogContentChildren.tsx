import {LoadingSpinner} from "@/components/ui/loading-spinner.tsx";
import {AlertDialogHeader, AlertDialogTitle} from "@/components/ui/alert-dialog.tsx";
import {AlertDialogDescription} from "@radix-ui/react-alert-dialog";

export type LoadingSpinnerDialogContentProps = {
    title: string;
}

export default function LoadingSpinnerDialogContentChildren({title}: Readonly<LoadingSpinnerDialogContentProps>) {

    return (
        <>
            <AlertDialogHeader>
                <AlertDialogTitle>
                    {title}
                </AlertDialogTitle>
                <AlertDialogDescription>
                    Loading...
                    <LoadingSpinner/>
                </AlertDialogDescription>
            </AlertDialogHeader>
        </>
    )
}