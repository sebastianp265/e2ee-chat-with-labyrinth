import SessionExpiredAlert from "@/components/app/SessionExpiredAlert.tsx";
import React, {ReactElement, useEffect, useState} from "react";

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
        localStorage.removeItem(import.meta.env.VITE_SESSION_EXPIRES_AT_LOCAL_STORAGE_KEY)
        localStorage.removeItem(import.meta.env.VITE_USER_ID)
    }

    useEffect(() => {
        function checkAuthentication() {
            console.log("Checking if session is active")
            const sessionExpiresAt = localStorage.getItem(import.meta.env.VITE_SESSION_EXPIRES_AT_LOCAL_STORAGE_KEY)
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