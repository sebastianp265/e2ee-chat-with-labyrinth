import ms, { StringValue } from 'ms';

// constants for local storage keys
export const LOGGED_USER_ID_KEY = 'logged_user_id';
export const SESSION_EXPIRES_AT_KEY = 'session_expires_at';
export const LABYRINTH_INSTANCE_KEY = 'labyrinth_instance_for_user_';

const sessionTimeoutEnv = import.meta.env.VITE_SESSION_TIMEOUT;
if (!sessionTimeoutEnv) {
    throw new Error('Session timeout environment variable is not defined');
}
export const SESSION_TIMEOUT_MS = ms(sessionTimeoutEnv as StringValue);
