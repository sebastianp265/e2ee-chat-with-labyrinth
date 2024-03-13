import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import {BrowserRouter, Navigate, Outlet, Route, Routes} from "react-router-dom";
import LoginPage from "@/pages/login/LoginPage.tsx";
import RootPage from "@/pages/root/RootPage.tsx";

export function PrivateRoutes() {
    const session_expires = localStorage.getItem("session_expires")
    let authenticated = false
    if (session_expires != null) {
        const session_expiration_date = parseInt(session_expires)
        const current_date = Date.now()
        if (session_expiration_date > current_date) {
            authenticated = true
        } else {
            localStorage.removeItem("session_expires")
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
                    <Route index={true} path='/' element={<RootPage/>}/>
                </Route>
                <Route path="/login" element={<LoginPage/>}/>
            </Routes>
        </BrowserRouter>
    </React.StrictMode>,
)
