import { ISessionProps } from '@/SessionCheckWrapper.tsx';
import { useState } from 'react';
import { useAuthContext } from '@/router.tsx';
import WelcomeToLabyrinthAlertDialog from '@/pages/messages/WelcomeToLabyrinthAlertDialog.tsx';
import ChatContent from '@/pages/messages/ChatContent.tsx';
import useLabyrinth, {
    LabyrinthStatus,
} from '@/pages/messages/hooks/useLabyrinth.ts';

export default function MessagesPage({
    sessionExpired,
    inactivateSession,
}: Readonly<ISessionProps>) {
    const { loggedUserId } = useAuthContext();
    const {
        labyrinthHookState,
        initializeLabyrinthFromFirstEpoch,
        initializeLabyrinthFromRecoveryCode,
        retryInitialization,
        finishInitializationFromDialog,
    } = useLabyrinth(loggedUserId);
    const [openDialog, setOpenDialog] = useState(false);

    return (
        <div className="flex h-full">
            <WelcomeToLabyrinthAlertDialog
                open={!sessionExpired && openDialog}
                setOpen={setOpenDialog}
                labyrinthHookState={labyrinthHookState}
                initializeLabyrinthFromRecoveryCode={
                    initializeLabyrinthFromRecoveryCode
                }
                initializeLabyrinthFromFirstEpoch={
                    initializeLabyrinthFromFirstEpoch
                }
                retryInitialization={retryInitialization}
                finishInitializationFromDialog={finishInitializationFromDialog}
            />

            <ChatContent
                loggedUserId={loggedUserId}
                labyrinth={
                    labyrinthHookState.status ===
                    LabyrinthStatus.READY_TO_USE_LABYRINTH
                        ? labyrinthHookState.instance
                        : null
                }
                inactivateSession={inactivateSession!!}
            />
        </div>
    );
}
