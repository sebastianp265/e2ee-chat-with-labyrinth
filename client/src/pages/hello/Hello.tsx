import {useEffect, useState} from "react";
import httpClient from "@/api/httpClient.ts";
import {Button} from "@/components/ui/button.tsx";
import {ISessionProps} from "@/SessionCheckWrapper.tsx";

export type HelloGetDTO = {
    name: string,
    principal: string,
    details: string,
    credentials: string,
    authorities: string[],
    sessionId: string
}

export default function Hello({inactivateSession}: Readonly<ISessionProps>) {
    const [hello, setHello] = useState({} as HelloGetDTO)
    const [resend, setResend] = useState(false)

    useEffect(() => {
        httpClient.get<HelloGetDTO>("/api/auth/hello")
            .then(response => {
                setHello(response.data)
            })
            .catch((error) => {
                if (error.response.status == 401) {
                    inactivateSession?.()
                }
            })
    }, [resend, inactivateSession]);

    return (
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
    )
}