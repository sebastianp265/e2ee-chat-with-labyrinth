import SessionExpiredAlert from '@/components/app/SessionExpiredAlert.tsx';
import React, {
    useEffect,
    useState,
    createContext,
    useContext,
    useCallback,
} from 'react';
import { sessionManager } from '@/lib/sessionManager.ts';
import { Outlet } from 'react-router-dom';

export interface ISessionProps {
    sessionExpired: boolean;
    inactivateSession: () => void;
}

const SessionReactContext = createContext<ISessionProps | null>(null);

export function useSessionContext() {
    const context = useContext(SessionReactContext);
    if (!context) {
        throw new Error(
            'useSessionContext must be used within a SessionCheckWrapper (Provider)',
        );
    }
    return context;
}

export default function SessionCheckWrapper() {
    const [sessionExpired, setSessionExpired] = useState(false);

    const inactivateSession = useCallback(() => {
        setSessionExpired(true);
        sessionManager.clearSession();
    }, []);

    useEffect(() => {
        let timerId: number | undefined;

        function checkAuthentication() {
            const sessionDetails = sessionManager.getSessionDetails();
            if (!sessionDetails) {
                inactivateSession();
                return;
            }

            const sessionMsLeft = sessionDetails.expiresAt - Date.now();
            if (sessionMsLeft < 0) {
                inactivateSession();
                return;
            }

            if (timerId) {
                clearTimeout(timerId);
            }
            timerId = window.setTimeout(checkAuthentication, sessionMsLeft);
        }

        checkAuthentication();

        return () => {
            if (timerId) {
                clearTimeout(timerId);
            }
        };
    }, [inactivateSession]);

    const contextValue: ISessionProps = React.useMemo(
        () => ({
            sessionExpired,
            inactivateSession,
        }),
        [sessionExpired, inactivateSession],
    );

    return (
        <SessionReactContext.Provider value={contextValue}>
            {sessionExpired && <SessionExpiredAlert />}
            <Outlet />
        </SessionReactContext.Provider>
    );
}
