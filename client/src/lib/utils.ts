import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import {
    asciiStringToBytes,
    bytesToAsciiString,
} from '@sebastianp265/safe-server-side-storage-client/crypto/utils';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function bytesToBase64String(bytes: Uint8Array): string {
    return btoa(bytesToAsciiString(bytes));
}

export function base64StringToBytes(base64String: string): Uint8Array {
    return asciiStringToBytes(atob(base64String));
}
