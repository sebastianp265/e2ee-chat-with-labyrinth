import { LoginForm } from '@/components/app/login/LoginForm.tsx';
import { useNavigate } from 'react-router-dom';
import { CustomApiError } from '@/lib/errorUtils.ts';
import { useMutation } from '@tanstack/react-query';
import {
    authService,
    LoginRequestDTO,
    LoginResponseDTO,
} from '@/api/authService';
import { sessionManager } from '@/lib/sessionManager.ts';
import { APP_ROUTES } from '@/constants/routes.ts';
import TestNote from './TestNote';

export default function LoginPage() {
    const navigate = useNavigate();

    const loginMutation = useMutation<
        LoginResponseDTO,
        CustomApiError,
        LoginRequestDTO
    >({
        mutationFn: authService.login,
        onSuccess: (data: LoginResponseDTO) => {
            sessionManager.setUserIdOnLogin(data.userId);
            navigate(`/${APP_ROUTES.MESSAGES}`);
        },
    });

    return (
        <div className="w-full min-h-screen flex flex-col items-center pt-[15vh] sm:pt-[20vh]">
            <TestNote />
            <div className="w-full max-w-sm">
                <LoginForm
                    handleSubmit={loginMutation.mutate}
                    loginError={
                        loginMutation.error?.userFriendlyMessage ?? null
                    }
                    isPending={loginMutation.isPending}
                />
            </div>
        </div>
    );
}
