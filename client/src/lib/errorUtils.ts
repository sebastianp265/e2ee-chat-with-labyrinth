import { AxiosError } from 'axios';
import { z } from 'zod';

const BackendApiErrorDataSchema = z.object({
    errorCode: z.string(),
    errorDetails: z.record(z.string(), z.string()).nullish(),
});

export interface CustomApiError {
    userFriendlyMessage: string;
    statusCode?: number;
    errorCode?: string;
    isNetworkError?: boolean;
    isRequestSetupError?: boolean;
    originalError: any;
}

const errorCodeMessages: Record<
    string,
    string | ((errorDetails?: Record<string, string> | null) => string)
> = {
    USER_NOT_FOUND: (errorDetails) => {
        const username = errorDetails?.got;
        if (username) {
            return `User with username '${username}' not found.`;
        }
        return 'User not found.';
    },
    ALREADY_REGISTERED_TO_LABYRINTH:
        'This account seems to be already set up. Please try logging in or contact support if you believe this is an error.',
    EPOCH_ACCESS_DENIED:
        'Login failed due to an account access issue. Please try again later or contact support.',
    VIRTUAL_DEVICE_ACCESS_DENIED:
        'Login from this device is currently not permitted. Please try again from an authorized device or contact support.',
};

export function transformAxiosError(error: Error): CustomApiError {
    if (!(error instanceof AxiosError)) {
        console.error('Unexpected non-Axios error:', error);
        return {
            userFriendlyMessage: 'An unexpected error occurred. Please try again.',
            originalError: error,
        };
    }

    const statusCode = error.response?.status;
    const responseData = error.response?.data;

    if (error.response) {
        if (responseData != null) {
            const parsedResult = BackendApiErrorDataSchema.safeParse(responseData);
            if (parsedResult.success) {
                const { errorCode, errorDetails } = parsedResult.data;
                if (errorCode && errorCodeMessages[errorCode]) {
                    const messageOrFn = errorCodeMessages[errorCode];
                    const message =
                        typeof messageOrFn === 'function'
                            ? messageOrFn(errorDetails)
                            : messageOrFn;
                    return {
                        userFriendlyMessage: message,
                        statusCode,
                        errorCode,
                        originalError: error,
                    };
                }
            } else {
                console.error(
                    'Backend error response did not match expected schema:',
                    {
                        responseData,
                        zodIssues: parsedResult.error.issues,
                        originalAxiosError: error,
                    },
                );
            }
        }

        if (statusCode === 401) {
            return {
                userFriendlyMessage:
                    'Invalid username or password. Please try again.',
                statusCode,
                originalError: error,
            };
        }

        console.error(
            'Unhandled server error or unmapped/malformed custom error:',
            { statusCode, responseData, originalAxiosError: error },
        );
        return {
            userFriendlyMessage:
                'The server returned an unexpected error. Please try again later.',
            statusCode,
            originalError: error,
        };
    }

    if (error.request) {
        return {
            userFriendlyMessage:
                'Login failed. Unable to connect to the server. Please check your internet connection and try again.',
            isNetworkError: true,
            originalError: error,
        };
    }

    console.error('Request setup error:', error);
    return {
        userFriendlyMessage:
            'An unexpected error occurred while preparing your request. Please try again.',
        isRequestSetupError: true,
        originalError: error,
    };
} 