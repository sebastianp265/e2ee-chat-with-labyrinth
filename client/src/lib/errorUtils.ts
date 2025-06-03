import { AxiosError } from 'axios';
import { z } from 'zod';

const BackendApiErrorDataSchema = z.object({
    errorCode: z.string(),
    errorDetails: z.record(z.string(), z.string()).nullish(),
});

export class CustomApiError extends Error {
    statusCode?: number;
    errorCode?: string;
    isNetworkError?: boolean;
    isRequestSetupError?: boolean;
    originalError: any;

    constructor(
        userFriendlyMessage: string,
        options?: {
            statusCode?: number;
            errorCode?: string;
            isNetworkError?: boolean;
            isRequestSetupError?: boolean;
            originalError?: any;
        },
    ) {
        super(userFriendlyMessage);
        this.name = 'CustomApiError';
        this.statusCode = options?.statusCode;
        this.errorCode = options?.errorCode;
        this.isNetworkError = options?.isNetworkError;
        this.isRequestSetupError = options?.isRequestSetupError;
        this.originalError = options?.originalError;

        Object.setPrototypeOf(this, CustomApiError.prototype);
    }

    get userFriendlyMessage(): string {
        return this.message;
    }
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
    CHAT_INBOX_NOT_FOUND:
        'The requested chat inbox could not be found. Please try again or contact support if the issue persists.',
};

function parseBackendError(
    responseData: any,
    statusCode: number,
    originalError: AxiosError,
): CustomApiError {
    const parsedResult = BackendApiErrorDataSchema.safeParse(responseData);
    if (parsedResult.success) {
        const { errorCode, errorDetails } = parsedResult.data;
        if (errorCode && errorCodeMessages[errorCode]) {
            const messageOrFn = errorCodeMessages[errorCode];
            const message =
                typeof messageOrFn === 'function'
                    ? messageOrFn(errorDetails)
                    : messageOrFn;
            return new CustomApiError(message, {
                statusCode,
                errorCode,
                originalError,
            });
        }
    } else {
        console.error(
            'Backend error response did not match expected schema:',
            {
                responseData,
                zodIssues: parsedResult.error.issues,
                originalAxiosError: originalError,
            },
        );
    }
    return new CustomApiError(
        'The server returned an unexpected error. Please try again later.',
        { statusCode, originalError },
    );
}

function handleAxiosResponseError(error: AxiosError): CustomApiError {
    const statusCode = error.response?.status;
    const responseData = error.response?.data;

    if (statusCode === 401) {
        return new CustomApiError(
            'Invalid username or password. Please try again.',
            { statusCode, originalError: error },
        );
    }

    if (responseData != null && statusCode) {
        return parseBackendError(responseData, statusCode, error);
    }

    console.error('Unhandled server error or unmapped/malformed custom error:', {
        statusCode,
        responseData,
        originalAxiosError: error,
    });
    return new CustomApiError(
        'The server returned an unexpected error. Please try again later.',
        { statusCode, originalError: error },
    );
}

export function transformAxiosError(error: Error): CustomApiError {
    if (!(error instanceof AxiosError)) {
        console.error('Unexpected non-Axios error:', error);
        return new CustomApiError(
            'An unexpected error occurred. Please try again.',
            { originalError: error },
        );
    }

    if (error.response) {
        return handleAxiosResponseError(error);
    }

    if (error.request) {
        return new CustomApiError(
            'Login failed. Unable to connect to the server. Please check your internet connection and try again.',
            { isNetworkError: true, originalError: error },
        );
    }

    console.error('Request setup error:', error);
    return new CustomApiError(
        'An unexpected error occurred while preparing your request. Please try again.',
        { isRequestSetupError: true, originalError: error },
    );
}
