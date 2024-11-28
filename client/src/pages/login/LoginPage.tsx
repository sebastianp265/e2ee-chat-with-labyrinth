import {LoginForm} from "@/components/app/login/LoginForm.tsx";
import axiosInstance from "@/api/axios/axiosInstance.ts";
import {useNavigate} from "react-router-dom";
import {Button} from "@/components/ui/button.tsx";
import {LOGGED_USER_ID_KEY} from "@/constants.ts";

export type LoginRequestDTO = {
    username: string,
    password: string
}

export type LoginResponseDTO = {
    userID: string,
}

export default function LoginPage() {
    const navigate = useNavigate()
    const handleSubmit = (loginRequest: LoginRequestDTO) => {
        axiosInstance.post<LoginResponseDTO>("/api/auth/login", loginRequest)
            .then((response) => {
                localStorage.setItem(LOGGED_USER_ID_KEY, response.data.userID)
                navigate("/")
            })
            .catch(reason => {
                console.log(reason)
            })
    }
    const isNotAuthenticated = localStorage.getItem("session_expires") === null

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