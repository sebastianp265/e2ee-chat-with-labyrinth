import SessionExpiredAlert from "@/components/app/SessionExpiredAlert.tsx";
import React, {ReactElement, useEffect, useState} from "react";
import {INBOX_ID_KEY, LOGGED_USER_ID_KEY, SESSION_EXPIRES_AT_KEY} from "@/constants.ts";

export interface ISessionProps {
    sessionExpired?: boolean,
    inactivateSession?: () => void
}

interface ISessionCheckWrapper {
    children: ReactElement
}

export default function SessionCheckWrapper({children}: Readonly<ISessionCheckWrapper>) {
    const [sessionExpired, setSessionExpired] = useState(false)

    const inactivateSession = () => {
        setSessionExpired(true)
        localStorage.removeItem(SESSION_EXPIRES_AT_KEY)
        localStorage.removeItem(LOGGED_USER_ID_KEY)
        localStorage.removeItem(INBOX_ID_KEY)
    }

    useEffect(() => {
        function checkAuthentication() {
            console.log("Checking if session is active")
            const sessionExpiresAt = localStorage.getItem(SESSION_EXPIRES_AT_KEY)
            if (sessionExpiresAt == null) {
                inactivateSession()
                return;
            }

            const sessionMsLeft = parseInt(sessionExpiresAt) - Date.now()
            console.log("Session left: ", sessionMsLeft, "ms")
            if (sessionMsLeft < 0) {
                inactivateSession()
                return;
            }
            setTimeout(checkAuthentication, sessionMsLeft)
        }

        checkAuthentication()
    }, []);

    return (
        <>
            {
                sessionExpired && <SessionExpiredAlert/>
            }
            {
                React.cloneElement(children, {sessionExpired, inactivateSession} as ISessionProps)
            }
        </>
    )
}