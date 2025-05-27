import {
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog.tsx';
import { Button } from '@/components/ui/button.tsx';

type ErrorDialogContentProps = {
    message: string;
    onTryAgainClicked: () => void;
};

export default function ErrorDialogContentChildren({
    message,
    onTryAgainClicked,
}: Readonly<ErrorDialogContentProps>) {
    return (
        <>
            <AlertDialogHeader>
                <AlertDialogTitle>
                    Oops! An error occurred
                </AlertDialogTitle>
                <AlertDialogDescription>{message}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <Button onClick={onTryAgainClicked}>Try again</Button>
            </AlertDialogFooter>
        </>
    );
}
