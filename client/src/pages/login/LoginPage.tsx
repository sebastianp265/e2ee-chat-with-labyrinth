import {LoginForm} from "@/components/app/login/LoginForm.tsx";
import {LoginRequestDTO} from "@/api/types.ts";
import axiosAPI from "@/api/axiosAPI.ts";
import {useNavigate} from "react-router-dom";
import {Button} from "@/components/ui/button.tsx";

export default function LoginPage() {
    const navigate = useNavigate()
    const isNotAuthenticated = localStorage.getItem("session_expires") == null
    const handleSubmit = (loginRequest: LoginRequestDTO) => {
        axiosAPI.post<number>("/api/auth/login", loginRequest)
            .then((response) => {
                localStorage.setItem(import.meta.env.VITE_USER_ID, response.data.toString())
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
                    <LoginForm handleSubmit={handleSubmit}/> :
                    <div className="flex flex-col items-center">
                        <h1>You are already logged in</h1>
                        <Button>Log out</Button> // TODO
                        <Button onClick={() => navigate("/")}>Home</Button>
                    </div>
            }
        </div>
    )
}