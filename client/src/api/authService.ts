import httpClient from './httpClient';
import { z } from 'zod';

export const LoginRequestSchema = z.object({
    username: z.string().min(1, { message: 'Username is required' }),
    password: z.string().min(1, { message: 'Password is required' }),
});

export const LoginResponseSchema = z.object({
    userId: z.string().uuid({ message: 'Invalid user ID format' }),
});

export type LoginRequestDTO = z.infer<typeof LoginRequestSchema>;
export type LoginResponseDTO = z.infer<typeof LoginResponseSchema>;

export const authService = {
    login: async (loginRequest: LoginRequestDTO) => {
        LoginRequestSchema.parse(loginRequest);
        const { data } = await httpClient.post<LoginResponseDTO>(
            '/api/auth/login',
            loginRequest,
        );
        return LoginResponseSchema.parse(data);
    },
};
