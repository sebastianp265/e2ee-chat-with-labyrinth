import { ISessionProps } from '@/SessionCheckWrapper.tsx';
import { useMemo } from 'react';
import { useAuthContext } from '@/router.tsx';
import ChatContent from '@/pages/messages/ChatContent.tsx';
import useLabyrinth, {
    LabyrinthStatus,
} from '@/pages/messages/hooks/useLabyrinth.ts';
import WelcomeToLabyrinthDialog from './WelcomeToLabyrinthDialog';

export default function MessagesPage({
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

    const labyrinth = useMemo(() => {
        return labyrinthHookState.status ===
            LabyrinthStatus.READY_TO_USE_LABYRINTH
            ? labyrinthHookState.instance
            : null;
    }, [labyrinthHookState]);

    return (
        <div className="flex h-full">
            <WelcomeToLabyrinthDialog
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
                labyrinth={labyrinth}
                // TODO: Refactor to not use '!'
                inactivateSession={inactivateSession!}
            />
        </div>
    );
}
