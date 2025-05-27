import { LOGGED_USER_ID_KEY, SESSION_EXPIRES_AT_KEY, SESSION_EXPIRATION_TIME_MIN } from '@/constants.ts';

interface AuthTokenDetails {
    userId: string;
    expiresAt: number;
}

function getUserId(): string | null {
    return localStorage.getItem(LOGGED_USER_ID_KEY);
}

function getSessionExpiresAt(): number | null {
    const expiresAtString = localStorage.getItem(SESSION_EXPIRES_AT_KEY);
    return expiresAtString ? parseInt(expiresAtString, 10) : null;
}

export const sessionManager = {
    setUserIdOnLogin(userId: string): void {
        localStorage.setItem(LOGGED_USER_ID_KEY, userId);
        this.refreshSessionExpiry();
    },

    clearSession(): void {
        localStorage.removeItem(LOGGED_USER_ID_KEY);
        localStorage.removeItem(SESSION_EXPIRES_AT_KEY);
    },

    isSessionValid(): boolean {
        const expiresAt = getSessionExpiresAt();
        if (!expiresAt) {
            return false;
        }
        return Date.now() < expiresAt;
    },

    getSessionDetails(): AuthTokenDetails | null {
        const userId = getUserId();
        const expiresAt = getSessionExpiresAt();

        if (userId && expiresAt) {
            return { userId, expiresAt };
        }
        return null;
    },

    refreshSessionExpiry(): void {
        const userId = getUserId();
        if (userId) {
            const expiresAt = Date.now() + SESSION_EXPIRATION_TIME_MIN * 60 * 1000;
            localStorage.setItem(SESSION_EXPIRES_AT_KEY, expiresAt.toString());
        }
    },
}; 