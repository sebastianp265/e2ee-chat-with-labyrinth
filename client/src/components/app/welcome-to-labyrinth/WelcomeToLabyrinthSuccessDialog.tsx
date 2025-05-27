import {
    AlertDialogAction,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export type WelcomeToLabyrinthSuccessDialogProps = {
    description: string;
};

export default function WelcomeToLabyrinthSuccessDialog({
    description,
}: WelcomeToLabyrinthSuccessDialogProps) {
    return (
        <>
            <AlertDialogHeader>
                <AlertDialogTitle>Success</AlertDialogTitle>
                <AlertDialogDescription>{description}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogAction>Close</AlertDialogAction>
            </AlertDialogFooter>
        </>
    );
}
