import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import {BrowserRouter, Navigate, Outlet, Route, Routes, useOutletContext} from "react-router-dom";
import LoginPage from "@/pages/login/LoginPage.tsx";
import SessionCheckWrapper from "@/SessionCheckWrapper.tsx";
import Hello from "@/pages/hello/Hello.tsx";
import MessagesPage from "@/pages/messages/MessagesPage.tsx";
import {INBOX_ID_KEY, LOGGED_USER_ID_KEY, SESSION_EXPIRES_AT_KEY} from "@/constants.ts";

type PrivateRouteContext = {
    loggedUserID: string,
    inboxID: string
}

export function PrivateRoutes() {
    const sessionExpires = localStorage.getItem(SESSION_EXPIRES_AT_KEY)
    if (sessionExpires == null) {
        return <Navigate to="/login"/>
    }

    const sessionExpirationTimestamp = parseInt(sessionExpires)
    const currentTimestamp = Date.now()

    const loggedUserID = localStorage.getItem(LOGGED_USER_ID_KEY)
    const inboxID = localStorage.getItem(INBOX_ID_KEY)

    if (sessionExpirationTimestamp <= currentTimestamp || loggedUserID === null || inboxID === null) {
        localStorage.removeItem(SESSION_EXPIRES_AT_KEY)
        localStorage.removeItem(LOGGED_USER_ID_KEY)
        localStorage.removeItem(INBOX_ID_KEY)
        return <Navigate to="login"/>
    }

    return <Outlet context={{loggedUserID, inboxID}}></Outlet>
}

export function usePrivateRouteContext() {
    return useOutletContext<PrivateRouteContext>()
}

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <BrowserRouter>
            <Routes>
                <Route element={<PrivateRoutes/>}>
                    <Route index={true} path='/' element={<Navigate to="/messages"/>}/>
                    <Route path="/messages" element={
                        <SessionCheckWrapper>
                            <MessagesPage/>
                        </SessionCheckWrapper>
                    }/>
                    <Route path="/hello" element={
                        <SessionCheckWrapper>
                            <Hello/>
                        </SessionCheckWrapper>
                    }/>
                </Route>
                <Route path="/login" element={<LoginPage/>}/>
            </Routes>
        </BrowserRouter>
    </React.StrictMode>,
)
