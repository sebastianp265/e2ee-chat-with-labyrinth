import axios from 'axios';
import { sessionManager } from '@/lib/sessionManager.ts';
import { transformAxiosError, CustomApiError } from '@/lib/errorUtils.ts';
import { DOMAIN_NAME } from '@/constants.ts';

const createAxiosInstance = () => {
    const client = axios.create({
        baseURL: `http://${DOMAIN_NAME}`,
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
