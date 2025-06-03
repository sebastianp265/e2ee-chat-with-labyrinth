import {
    createBrowserRouter,
    Navigate,
    Outlet,
    redirect,
    useLoaderData,
    useOutletContext,
} from 'react-router-dom';
import LoginPage from '@/pages/login/LoginPage.tsx';
import SessionCheckWrapper from '@/SessionCheckWrapper.tsx';
import MessagesPage from '@/pages/messages/MessagesPage.tsx';
import { sessionManager, AuthTokenDetails } from '@/lib/sessionManager.ts';
import { APP_ROUTES } from '@/constants/routes.ts';

export type AuthContextData = {
    loggedUserId: string;
};

function AuthContextOutlet() {
    const outletData = useLoaderData() as AuthTokenDetails;
    return (
        <Outlet
            context={
                { loggedUserId: outletData.userId } satisfies AuthContextData
            }
        />
    );
}

export function useAuthContext() {
    return useOutletContext<AuthContextData>();
}

export const router = createBrowserRouter([
    {
        id: 'root',
        path: `/${APP_ROUTES.ROOT}`,
        element: <AuthContextOutlet />,
        loader: async () => {
            const sessionDetails = sessionManager.getSessionDetails();
            if (!sessionDetails) {
                sessionManager.clearSession();
                return redirect(`/${APP_ROUTES.LOGIN}`);
            }
            return sessionDetails;
        },
        children: [
            {
                element: <SessionCheckWrapper />,
                children: [
                    {
                        index: true,
                        element: (
                            <Navigate to={`/${APP_ROUTES.MESSAGES}`} replace />
                        ),
                    },
                    {
                        path: APP_ROUTES.MESSAGES,
                        element: <MessagesPage />,
                    },
                ],
            },
        ],
    },
    {
        path: APP_ROUTES.LOGIN,
        loader: async () => {
            if (sessionManager.isSessionValid()) {
                return redirect(`/${APP_ROUTES.MESSAGES}`);
            }
            return null;
        },
        element: <LoginPage />,
    },
]);
