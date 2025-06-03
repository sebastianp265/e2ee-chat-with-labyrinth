import { LoginForm } from '@/components/app/login/LoginForm.tsx';
import { useNavigate } from 'react-router-dom';
import { CustomApiError } from '@/lib/errorUtils.ts';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
    authService,
    LoginRequestDTO,
    LoginResponseDTO,
} from '@/api/authService';
import { sessionManager } from '@/lib/sessionManager.ts';
import { APP_ROUTES } from '@/constants/routes.ts';

export default function LoginPage() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const loginMutation = useMutation<
        LoginResponseDTO,
        CustomApiError,
        LoginRequestDTO
    >({
        mutationFn: authService.login,
        onSuccess: (data: LoginResponseDTO) => {
            queryClient.invalidateQueries({ queryKey: ['user'] });
            sessionManager.setUserIdOnLogin(data.userId);
            navigate(`/${APP_ROUTES.MESSAGES}`);
        },
    });

    return (
        <div className="w-[60%] h-[60%] m-auto pt-[25vh]">
            <LoginForm
                handleSubmit={loginMutation.mutate}
                loginError={loginMutation.error?.userFriendlyMessage ?? null}
                isPending={loginMutation.isPending}
            />
        </div>
    );
}
