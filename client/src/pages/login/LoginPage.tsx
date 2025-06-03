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
        <div className="w-full min-h-screen flex flex-col items-center pt-[15vh] sm:pt-[20vh]">
            <div className="w-full max-w-sm p-6 bg-slate-50 rounded-xl shadow-xl border border-slate-200 mb-8">
                <h3 className="text-lg font-semibold mb-3 text-center text-slate-700">
                    🧪 Test Credentials
                </h3>
                <div className="space-y-2 text-sm">
                    <p className="text-slate-600">
                        <span className="font-medium text-slate-700">Usernames:</span>{" "}
                        <code className="px-1 py-0.5 bg-slate-200 rounded text-slate-700">alice</code>,{" "}
                        <code className="px-1 py-0.5 bg-slate-200 rounded text-slate-700">bob</code>,{" "}
                        <code className="px-1 py-0.5 bg-slate-200 rounded text-slate-700">carol</code>
                    </p>
                    <p className="text-slate-600">
                        <span className="font-medium text-slate-700">Password:</span>{" "}
                        <code className="px-1 py-0.5 bg-slate-200 rounded text-slate-700">
                            123456
                        </code>
                    </p>
                </div>
                <p className="mt-4 text-xs text-slate-500 text-center italic">
                    You can test chatting in two different browsers or login, send a message, and then logout to switch to a different user.
                </p>
            </div>
            <div className="w-full max-w-sm">
                <LoginForm
                    handleSubmit={loginMutation.mutate}
                    loginError={loginMutation.error?.userFriendlyMessage ?? null}
                    isPending={loginMutation.isPending}
                />
            </div>
        </div>
    );
}
