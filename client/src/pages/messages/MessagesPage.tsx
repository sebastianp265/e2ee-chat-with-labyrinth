import { ISessionProps } from '@/SessionCheckWrapper.tsx';
import { useEffect, useState } from 'react';
import { usePrivateRouteContext } from '@/main.tsx';
import WelcomeToLabyrinthAlertDialog from '@/pages/messages/WelcomeToLabyrinthAlertDialog.tsx';
import ChatContent from '@/pages/messages/ChatContent.tsx';
import useLabyrinth, {
    LabyrinthLoadState,
} from '@/pages/messages/hooks/useLabyrinth.ts';

export default function MessagesPage({
    sessionExpired,
}: Readonly<ISessionProps>) {
    const { loggedUserId } = usePrivateRouteContext();
    const {
        labyrinth,
        initialLoadState,
        retryInitialization,
        setLabyrinthFromRecoveryCode,
        setLabyrinthFromFirstEpoch,
    } = useLabyrinth(loggedUserId);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        if (initialLoadState !== LabyrinthLoadState.LOADING) {
            setOpen(true);
        }
    }, [initialLoadState]);

    return (
        <div className="flex h-full">
            {initialLoadState !== LabyrinthLoadState.LOADING && (
                <WelcomeToLabyrinthAlertDialog
                    open={!sessionExpired && open}
                    setOpen={setOpen}
                    labyrinthLoadState={initialLoadState}
                    setLabyrinthFromRecoveryCode={setLabyrinthFromRecoveryCode}
                    setLabyrinthFromFirstEpoch={setLabyrinthFromFirstEpoch}
                    retryInitialization={retryInitialization}
                />
            )}

            <ChatContent loggedUserId={loggedUserId} labyrinth={labyrinth} />
        </div>
    );
}
