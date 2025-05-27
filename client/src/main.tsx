import ReactDOM from 'react-dom/client';
import './index.css';
import {
    createBrowserRouter,
    Navigate,
    Outlet,
    RouterProvider,
    useOutletContext,
    redirect,
    useLoaderData,
} from 'react-router-dom';
import LoginPage from '@/pages/login/LoginPage.tsx';
import SessionCheckWrapper from '@/SessionCheckWrapper.tsx';
import Hello from '@/pages/hello/Hello.tsx';
import MessagesPage from '@/pages/messages/MessagesPage.tsx';
import { bytesSerializerProvider } from '@sebastianp265/safe-server-side-storage-client';
import { base64StringToBytes, bytesToBase64String } from '@/lib/utils.ts';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { sessionManager, AuthTokenDetails } from '@/lib/sessionManager.ts';

const queryClient = new QueryClient();

bytesSerializerProvider.bytesSerializer = {
    serialize: bytesToBase64String,
    deserialize: base64StringToBytes,
};

type AuthContextData = {
    loggedUserId: string;
};

function PrivateRoutesLayout() {
    const { userId: loggedUserId } = useLoaderData() as AuthTokenDetails;

    return <Outlet context={{ loggedUserId }} />;
}

export function useAuthContext() {
    return useOutletContext<AuthContextData>();
}

const router = createBrowserRouter([
    {
        id: 'root',
        path: '/',
        element: <PrivateRoutesLayout />,
        loader: async () => {
            const sessionDetails = sessionManager.getSessionDetails();
            if (!sessionDetails) {
                sessionManager.clearSession();
                return redirect('/login');
            }
            return sessionDetails;
        },
        children: [
            {
                index: true,
                element: <Navigate to="/messages" replace />,
            },
            {
                path: 'messages',
                element: (
                    <SessionCheckWrapper>
                        <MessagesPage />
                    </SessionCheckWrapper>
                ),
            },
            {
                path: 'hello',
                element: (
                    <SessionCheckWrapper>
                        <Hello />
                    </SessionCheckWrapper>
                ),
            },
        ],
    },
    {
        path: '/login',
        loader: async () => {
            if (sessionManager.isSessionValid()) {
                return redirect('/messages');
            }
            return null;
        },
        element: <LoginPage />,
    },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
    <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
    </QueryClientProvider>,
);
