import {useEffect, useState} from "react";
import axiosAPI from "@/api/axiosAPI.ts";
import {Hello} from "@/api/types.ts";
import {Button} from "@/components/ui/button.tsx";
import SessionExpiredAlert from "@/pages/root/SessionExpiredAlert.tsx";

export default function RootPage() {
    const [hello, setHello] = useState({} as Hello)
    const [authenticated, setAuthenticated] = useState(true)
    const [resend, setResend] = useState(false)

    useEffect(() => {
        axiosAPI.get<Hello>("/api/auth/hello")
            .then(response => {
                setHello(response.data)
            })
            .catch((error) => {
                if (error.response.status == 401) {
                    setAuthenticated(false)
                    localStorage.removeItem("session_expires")
                }
            })
    }, [resend]);

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
            <div>
                <h1>Hello authenticated world!</h1>
                <h2>Name: {hello.name}</h2>
                <h2>Details: {hello.details}</h2>
                <h2>Authorities: {hello.authorities}</h2>
                <h2>Credentials: {hello.credentials}</h2>
                <h2>Principal: {hello.principal}</h2>
                <h2>SessionId: {hello.sessionId}</h2>
                <Button onClick={() => setResend(!resend)}>Resend</Button>
            </div>
        </>
    )
}