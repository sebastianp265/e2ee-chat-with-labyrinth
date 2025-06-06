import axios from 'axios';
import { sessionManager } from '@/lib/sessionManager.ts';
import { transformAxiosError, CustomApiError } from '@/lib/errorUtils.ts';

const createAxiosInstance = () => {
    const baseURL =
        import.meta.env.MODE === 'development'
            ? import.meta.env.VITE_SERVER_URL
            : import.meta.env.VITE_DOMAIN_URL;
    if (!baseURL) {
        throw new Error('Necessary environment variables are not set');
    }

    const client = axios.create({
        baseURL,
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        withCredentials: true,
    });

    client.interceptors.request.use((request) => {
        return request;
    });

    client.interceptors.response.use(
        (response) => {
            sessionManager.refreshSessionExpiry();
            return response;
        },
        (error: any) => {
            const customError: CustomApiError = transformAxiosError(error);
            sessionManager.refreshSessionExpiry();
            return Promise.reject(customError);
        },
    );

    return client;
};

const httpClient = createAxiosInstance();
export default httpClient;
