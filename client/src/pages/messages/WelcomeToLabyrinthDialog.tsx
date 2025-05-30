import { Dialog, DialogContent } from '@/components/ui/dialog.tsx';
import WelcomeToLabyrinthDialogContentChildren, {
    WelcomeToLabyrinthDialogContentProps,
} from './WelcomeToLabyrinthDialogContentChildren';
import { useMemo } from 'react';
import { LabyrinthStatus } from './hooks/useLabyrinth';

export default function WelcomeToLabyrinthDialog({
    labyrinthHookState,
    ...otherDialogContentProps
}: Readonly<WelcomeToLabyrinthDialogContentProps>) {
    const isClosed = useMemo(() => {
        return [
            LabyrinthStatus.INITIAL_LOADING,
            LabyrinthStatus.READY_TO_USE_LABYRINTH,
        ].includes(labyrinthHookState.status);
    }, [labyrinthHookState.status]);

    if (isClosed) {
        return null;
    }

    return (
        <Dialog open={!isClosed} onOpenChange={() => {}}>
            <DialogContent hideClose>
                <WelcomeToLabyrinthDialogContentChildren
                    labyrinthHookState={labyrinthHookState}
                    {...otherDialogContentProps}
                />
            </DialogContent>
        </Dialog>
    );
}
