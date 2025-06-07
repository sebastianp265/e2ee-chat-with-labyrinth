import { useCallback, useMemo } from 'react';
import { useAuthContext } from '@/lib/AuthContext.tsx'; // Import new context hook
import ChatContent from '@/pages/messages/ChatContent.tsx';
import useLabyrinth, {
    LabyrinthStatus,
} from '@/pages/messages/hooks/useLabyrinth.ts';
import WelcomeToLabyrinthDialog from './WelcomeToLabyrinthDialog';
import { useSessionContext } from '@/SessionCheckWrapper.tsx';
import { CustomApiError } from '@/lib/errorUtils.ts';
import httpClient from '@/api/httpClient.ts';
import { useNavigate } from 'react-router-dom'; // This remains

export default function MessagesPage() {
    const { sessionExpired, inactivateSession } = useSessionContext();
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

    const navigate = useNavigate();

    const handleLogout = useCallback(() => {
        httpClient
            .post('/api/auth/logout')
            .catch((error: CustomApiError) => {
                console.error('Logout failed:', error);
            })
            .finally(() => {
                inactivateSession();
                navigate('/login');
            });
    }, [navigate, inactivateSession]);
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
                sessionExpired={sessionExpired}
                handleLogout={handleLogout}
            />

            <ChatContent
                loggedUserId={loggedUserId}
                labyrinth={labyrinth}
                inactivateSession={inactivateSession}
                sessionExpired={sessionExpired}
                handleLogout={handleLogout}
            />
        </div>
    );
}
