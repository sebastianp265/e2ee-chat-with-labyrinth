import {LoginForm} from "@/components/app/login/LoginForm.tsx";
import axiosInstance from "@/api/axios/axiosInstance.ts";
import {useNavigate} from "react-router-dom";
import {Button} from "@/components/ui/button.tsx";
import {INBOX_ID_KEY, LOGGED_USER_ID_KEY} from "@/constants.ts";

export type LoginRequestDTO = {
    username: string,
    password: string
}

export type LoginResponseDTO = {
    userID: string,
    inboxID: string
}

export default function LoginPage() {
    const navigate = useNavigate()
    const isNotAuthenticated = localStorage.getItem("session_expires") == null
    const handleSubmit = (loginRequest: LoginRequestDTO) => {
        axiosInstance.post<LoginResponseDTO>("/api/auth/login", loginRequest)
            .then((response) => {
                localStorage.setItem(LOGGED_USER_ID_KEY, response.data.userID)
                localStorage.setItem(INBOX_ID_KEY, response.data.inboxID)
                navigate("/")
            })
            .catch(reason => {
                console.log(reason)
            })
    }

    return (
        <div className="w-[60%] h-[60%] m-auto pt-[25vh]">
            {
                isNotAuthenticated ?
                    <LoginForm handleSubmit={handleSubmit}/>
                    :
                    <div className="flex flex-col items-center">
                        <h1>You are already logged in</h1>
                        <Button>Log out</Button> // TODO
                        <Button onClick={() => navigate("/")}>Home</Button>
                    </div>
            }
        </div>
    )
}