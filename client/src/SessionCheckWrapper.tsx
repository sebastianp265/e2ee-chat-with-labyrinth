import SessionExpiredAlert from "@/components/app/SessionExpiredAlert.tsx";
import React, {ReactElement, useEffect, useState} from "react";
import {LOGGED_USER_ID_KEY, SESSION_EXPIRES_AT_KEY} from "@/constants.ts";

export interface ISessionProps {
    inactivateSession?: () => void
}

interface ISessionCheckWrapper {
    children: ReactElement
}

export default function SessionCheckWrapper({children}: Readonly<ISessionCheckWrapper>) {
    const [sessionExpired, setSessionExpired] = useState(false)

    const handleInactivateSession = () => {
        setSessionExpired(true)
        localStorage.removeItem(SESSION_EXPIRES_AT_KEY)
        localStorage.removeItem(LOGGED_USER_ID_KEY)
    }

    useEffect(() => {
        function checkAuthentication() {
            console.log("Checking if session is active")
            const sessionExpiresAt = localStorage.getItem(SESSION_EXPIRES_AT_KEY)
            if (sessionExpiresAt == null) {
                handleInactivateSession()
                return;
            }

            const sessionMsLeft = parseInt(sessionExpiresAt) - Date.now()
            console.log("Session left: ", sessionMsLeft, "ms")
            if (sessionMsLeft < 0) {
                handleInactivateSession()
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
                React.cloneElement(children, {inactivateSession: handleInactivateSession} as ISessionProps)
            }
        </>
    )
}