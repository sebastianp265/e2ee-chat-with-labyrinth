import SessionExpiredAlert from '@/components/app/SessionExpiredAlert.tsx';
import React, { ReactElement, useEffect, useState } from 'react';
import { sessionManager } from '@/lib/sessionManager.ts';

export interface ISessionProps {
    sessionExpired?: boolean;
    inactivateSession?: () => void;
}

interface ISessionCheckWrapper {
    children: ReactElement;
}

// TODO: add outlet context? is it possible?
export default function SessionCheckWrapper({
    children,
}: Readonly<ISessionCheckWrapper>) {
    const [sessionExpired, setSessionExpired] = useState(false);

    const inactivateSession = () => {
        setSessionExpired(true);
        sessionManager.clearSession();
    };

    useEffect(() => {
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
            setTimeout(checkAuthentication, sessionMsLeft);
        }

        checkAuthentication();
    }, []);

    return (
        <>
            {sessionExpired && <SessionExpiredAlert />}
            {React.cloneElement(children, {
                sessionExpired,
                inactivateSession,
            } as ISessionProps)}
        </>
    );
}
