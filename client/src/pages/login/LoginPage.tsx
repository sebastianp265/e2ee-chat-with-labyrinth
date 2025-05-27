import { LoginForm } from '@/components/app/login/LoginForm.tsx';
import httpClient from '@/api/httpClient.ts';
import { useNavigate } from 'react-router-dom';
import { LOGGED_USER_ID_KEY, SESSION_EXPIRES_AT_KEY } from '@/constants.ts';
import { useEffect, useState } from 'react';
import { CustomApiError } from '@/lib/errorUtils.ts';

export type LoginRequestDTO = {
    username: string;
    password: string;
};

export type LoginResponseDTO = {
    userId: string;
};

export default function LoginPage() {
    const navigate = useNavigate();
    const [loginError, setLoginError] = useState<string | null>(null);

    useEffect(() => {
        if (localStorage.getItem(SESSION_EXPIRES_AT_KEY) !== null) {
            navigate('/');
        }
    }, [navigate]);

    const handleSubmit = (loginRequest: LoginRequestDTO) => {
        setLoginError(null);
        httpClient
            .post<LoginResponseDTO>('/api/auth/login', loginRequest)
            .then((response) => {
                localStorage.setItem(LOGGED_USER_ID_KEY, response.data.userId);
                navigate('/');
            })
            .catch((error: CustomApiError) => {
                setLoginError(error.userFriendlyMessage);
            });
    };

    return (
        <div className="w-[60%] h-[60%] m-auto pt-[25vh]">
            <LoginForm handleSubmit={handleSubmit} loginError={loginError} />
        </div>
    );
}
