import SessionExpiredAlert from "@/components/app/messages/SessionExpiredAlert.tsx";
import {ReactNode, useEffect, useState} from "react";

export interface AuthenticationProps {
    children: ReactNode
    authenticated: boolean
    setAuthenticated: (authenticated: boolean) => void
}

export default function App() {
    const [authenticated, setAuthenticated] = useState(true)

    useEffect(() => {
        function checkAuthentication() {
            console.log("Checking if session is active")
            const sessionExpires = localStorage.getItem("session_expires")
            if (sessionExpires == null) {
                setAuthenticated(false)
                return;
            }

            const sessionMsLeft = parseInt(sessionExpires) - Date.now()
            console.log("Session left: ", sessionMsLeft, "ms")
            if (sessionMsLeft < 0) {
                setAuthenticated(false)
                localStorage.removeItem("session_expires")
                return;
            }
            setTimeout(checkAuthentication, sessionMsLeft)
        }

        checkAuthentication()
    }, []);

    return (
        <>
            {
                !authenticated && <SessionExpiredAlert/>
            }
        </>
    )
}