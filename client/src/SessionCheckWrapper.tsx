import SessionExpiredAlert from '@/components/app/SessionExpiredAlert.tsx';
import { useEffect, useState } from 'react';
import { sessionManager } from '@/lib/sessionManager.ts';
import { Outlet, useOutletContext } from 'react-router-dom';

export interface ISessionProps {
    sessionExpired: boolean;
    inactivateSession: () => void;
}

export function useSessionContext() {
    return useOutletContext<ISessionProps>();
}

export default function SessionCheckWrapper() {
    const [sessionExpired, setSessionExpired] = useState(false);

    const inactivateSession = () => {
        setSessionExpired(true);
        sessionManager.clearSession();
    };

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

    const contextValue: ISessionProps = {
        sessionExpired,
        inactivateSession,
    };

    return (
        <>
            {sessionExpired && <SessionExpiredAlert />}
            <Outlet context={contextValue} />
        </>
    );
}
