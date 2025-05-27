import { LoginForm } from '@/components/app/login/LoginForm.tsx';
import { useNavigate } from 'react-router-dom';
import { LOGGED_USER_ID_KEY, SESSION_EXPIRES_AT_KEY } from '@/constants.ts';
import { useEffect } from 'react';
import { CustomApiError } from '@/lib/errorUtils.ts';
import { useMutation } from '@tanstack/react-query';
import { authService, LoginRequestDTO, LoginResponseDTO } from '@/api/authService';

export default function LoginPage() {
    const navigate = useNavigate();

    useEffect(() => {
        if (localStorage.getItem(SESSION_EXPIRES_AT_KEY) !== null) {
            navigate('/');
        }
    }, [navigate]);

    const loginMutation = useMutation<LoginResponseDTO, CustomApiError, LoginRequestDTO>({
        mutationFn: authService.login,
        onSuccess: (data: LoginResponseDTO) => {
            localStorage.setItem(LOGGED_USER_ID_KEY, data.userId);
            navigate('/');
        },
    });

    return (
        <div className="w-[60%] h-[60%] m-auto pt-[25vh]">
            <LoginForm
                handleSubmit={loginMutation.mutate}
                loginError={loginMutation.error?.userFriendlyMessage || null}
                isPending={loginMutation.isPending}
            />
        </div>
    );
}
