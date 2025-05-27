import { LoginForm } from '@/components/app/login/LoginForm.tsx';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { CustomApiError } from '@/lib/errorUtils.ts';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authService, LoginRequestDTO, LoginResponseDTO } from '@/api/authService';
import { sessionManager } from '@/lib/sessionManager.ts';

export default function LoginPage() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    useEffect(() => {
        if (sessionManager.isSessionValid()) {
            navigate('/');
        }
    }, [navigate]);

    const loginMutation = useMutation<LoginResponseDTO, CustomApiError, LoginRequestDTO>({
        mutationFn: authService.login,
        onSuccess: (data: LoginResponseDTO) => {
            queryClient.invalidateQueries({ queryKey: ['user'] });
            sessionManager.setUserIdOnLogin(data.userId);
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
