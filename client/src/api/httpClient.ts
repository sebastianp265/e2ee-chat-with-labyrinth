import axios from 'axios';
import { sessionManager } from '@/lib/sessionManager.ts';
import { transformAxiosError, CustomApiError } from '@/lib/errorUtils.ts';

const createAxiosInstance = () => {
    const client = axios.create({
        baseURL: 'http://localhost:8080',
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
            if (customError.statusCode === 401) {
                sessionManager.clearSession();
            } else {
                sessionManager.refreshSessionExpiry();
            }
            return Promise.reject(customError);
        },
    );

    return client;
};

const httpClient = createAxiosInstance();
export default httpClient;
