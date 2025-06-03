import { useMemo } from 'react';
import { useAuthContext } from '@/lib/AuthContext.tsx'; // Import new context hook
import ChatContent from '@/pages/messages/ChatContent.tsx';
import useLabyrinth, {
    LabyrinthStatus,
} from '@/pages/messages/hooks/useLabyrinth.ts';
import WelcomeToLabyrinthDialog from './WelcomeToLabyrinthDialog';
import { useSessionContext } from '@/SessionCheckWrapper.tsx'; // This remains

export default function MessagesPage() {
    const { inactivateSession } = useSessionContext();
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
                inactivateSession={inactivateSession}
            />
        </div>
    );
}
