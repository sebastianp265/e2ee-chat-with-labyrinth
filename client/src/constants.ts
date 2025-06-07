import ms, { StringValue } from 'ms';

// constants for local storage keys
export const LOGGED_USER_ID_KEY = 'logged_user_id';
export const SESSION_EXPIRES_AT_KEY = 'session_expires_at';
export const LABYRINTH_INSTANCE_KEY = 'labyrinth_instance_for_user_';

const sessionTimeoutEnv = import.meta.env.VITE_SESSION_TIMEOUT;
if (typeof sessionTimeoutEnv !== 'string') {
    throw new Error('Session timeout environment variable is not defined');
}
export const SESSION_TIMEOUT_MS = ms(sessionTimeoutEnv as StringValue);

const domainName =
    import.meta.env.MODE === 'development'
        ? import.meta.env.VITE_SERVER_DOMAIN_AND_PORT
        : import.meta.env.VITE_DOMAIN_NAME;
if (typeof domainName !== 'string') {
    throw new Error('Necessary environment variables are not set');
}
export const DOMAIN_NAME = domainName;
