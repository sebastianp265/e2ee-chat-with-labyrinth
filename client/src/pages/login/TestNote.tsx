import { Button } from '@/components/ui/button.tsx';
import { useMutation } from '@tanstack/react-query';
import { CustomApiError } from '@/lib/errorUtils.ts';
import httpClient from '@/api/httpClient.ts';

export default function TestNote() {
    const resetAppStateMutation = useMutation<void, CustomApiError, void>({
        mutationFn: async () =>
            (await httpClient.post<void>('/api/chat-service/reset')).data,
    });

    const handleResetApplicationState = () => {
        localStorage.clear();
        resetAppStateMutation.mutate();
    };

    return (
        <div className="w-full max-w-sm p-6 bg-slate-50 rounded-xl shadow-xl border border-slate-200 mb-8">
            <h3 className="text-lg font-semibold mb-3 text-center text-slate-700">
                🧪 Test Credentials
            </h3>
            <div className="space-y-2 text-sm">
                <p className="text-slate-600">
                    <span className="font-medium text-slate-700">
                        Usernames:
                    </span>{' '}
                    <code className="px-1 py-0.5 bg-slate-200 rounded text-slate-700">
                        alice
                    </code>
                    ,{' '}
                    <code className="px-1 py-0.5 bg-slate-200 rounded text-slate-700">
                        bob
                    </code>
                    ,{' '}
                    <code className="px-1 py-0.5 bg-slate-200 rounded text-slate-700">
                        carol
                    </code>
                </p>
                <p className="text-slate-600">
                    <span className="font-medium text-slate-700">
                        Password:
                    </span>{' '}
                    <code className="px-1 py-0.5 bg-slate-200 rounded text-slate-700">
                        123456
                    </code>
                </p>
            </div>
            <p className="mt-4 text-xs text-slate-500 text-center italic">
                You can test chatting in two different browsers or login, send a
                message, and then logout to switch to a different user.
            </p>
            <p className="mt-4 text-xs text-slate-500 text-center italic">
                You can reset this device state and server state by clicking on
                this button:
            </p>
            <div className="flex justify-center mt-2 text-xs text-slate-500 text-center italic">
                <Button
                    className="text-xs"
                    variant="destructive"
                    size="sm"
                    onClick={handleResetApplicationState}
                >
                    Reset application state
                </Button>
            </div>
            {resetAppStateMutation.isSuccess && (
                <p className="mt-2 text-xs text-slate-500 text-center italic">
                    The application state has been reset successfully.
                </p>
            )}
            {resetAppStateMutation.isError && (
                <p className="mt-2 text-xs text-red-600 text-center italic">
                    Failed to reset application state. Please try again later.
                </p>
            )}
        </div>
    );
}
