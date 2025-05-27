import axios from 'axios';
import {
    SESSION_EXPIRATION_TIME_MIN,
    SESSION_EXPIRES_AT_KEY,
} from '@/constants.ts';
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
            localStorage.setItem(
                SESSION_EXPIRES_AT_KEY,
                (
                    Date.now() +
                    SESSION_EXPIRATION_TIME_MIN * 60 * 1000
                ).toString(),
            );
            return response;
        },
        (error: Error) => {
            const customError: CustomApiError = transformAxiosError(error);
            return Promise.reject(customError);
        },
    );

    return client;
};

const httpClient = createAxiosInstance();
export default httpClient;
