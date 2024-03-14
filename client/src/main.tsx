import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import {BrowserRouter, Navigate, Outlet, Route, Routes} from "react-router-dom";
import LoginPage from "@/pages/login/LoginPage.tsx";
import SessionCheckWrapper from "@/SessionCheckWrapper.tsx";
import Hello from "@/pages/hello/Hello.tsx";
import MessagesPage from "@/pages/messages/MessagesPage.tsx";

export function PrivateRoutes() {
    const session_expires = localStorage.getItem(import.meta.env.VITE_SESSION_EXPIRES_AT_LOCAL_STORAGE_KEY)
    let authenticated = false
    if (session_expires != null) {
        const session_expiration_date = parseInt(session_expires)
        const current_date = Date.now()
        if (session_expiration_date > current_date) {
            authenticated = true
        } else {
            localStorage.removeItem(import.meta.env.VITE_SESSION_EXPIRES_AT_LOCAL_STORAGE_KEY)
        }
    }
    return (
        authenticated ? <Outlet/> : <Navigate to="/login"/>
    )
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
