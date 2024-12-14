import ReactDOM from 'react-dom/client'
import './index.css'
import {BrowserRouter, Navigate, Outlet, Route, Routes, useOutletContext} from "react-router-dom";
import LoginPage from "@/pages/login/LoginPage.tsx";
import SessionCheckWrapper from "@/SessionCheckWrapper.tsx";
import Hello from "@/pages/hello/Hello.tsx";
import MessagesPage from "@/pages/messages/MessagesPage.tsx";
import {LOGGED_USER_ID_KEY, SESSION_EXPIRES_AT_KEY} from "@/constants.ts";

type PrivateRouteContext = {
    loggedUserId: string,
}

export function PrivateRoutes() {
    const sessionExpires = localStorage.getItem(SESSION_EXPIRES_AT_KEY)
    if (sessionExpires == null) {
        return <Navigate to="/login"/>
    }

    const sessionExpirationTimestamp = parseInt(sessionExpires)
    const currentTimestamp = Date.now()

    const loggedUserId = localStorage.getItem(LOGGED_USER_ID_KEY)

    if (sessionExpirationTimestamp <= currentTimestamp || loggedUserId === null) {
        localStorage.removeItem(SESSION_EXPIRES_AT_KEY)
        localStorage.removeItem(LOGGED_USER_ID_KEY)
        return <Navigate to="login"/>
    }

    return <Outlet context={{loggedUserId}}></Outlet>
}

export function usePrivateRouteContext() {
    return useOutletContext<PrivateRouteContext>()
}

ReactDOM.createRoot(document.getElementById('root')!).render(
    // <React.StrictMode>
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
    // </React.StrictMode>,
)
