import { createContext, useContext, useMemo } from 'react';
import { useLoaderData, Outlet } from 'react-router-dom';
import { AuthTokenDetails } from './sessionManager';

export type AuthContextData = {
    loggedUserId: string;
};

export const AuthContext = createContext<AuthContextData | null>(null);

export function useAuthContext() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuthContext must be used within an AuthProvider');
    }
    return context;
}

export function AuthProviderLayout() {
    const outletData = useLoaderData() as AuthTokenDetails;
    const userIdToProvide = outletData.userId;

    const authValue: AuthContextData = useMemo(
        () => ({
            loggedUserId: userIdToProvide,
        }),
        [userIdToProvide],
    );

    return (
        <AuthContext.Provider value={authValue}>
            <Outlet />
        </AuthContext.Provider>
    );
}
