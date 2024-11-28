export function random(numberOfBytes: number) {
    const buffer = new Uint8Array(numberOfBytes);
    crypto.getRandomValues(buffer);
    return buffer
}

export function cryptoAssert(expression: boolean) {
    if (!expression) throw new CryptoAssertionError();
}

export class CryptoAssertionError extends Error {

    public constructor() {
        super();

        Object.setPrototypeOf(this, CryptoAssertionError);
    }
}

export function bytes_equal(a: Uint8Array, b: Uint8Array) {
    if (a.length !== b.length) {
        return false
    }
    for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) {
            return false;
        }
    }

    return true
}

export function concat(...arrays: Uint8Array[]): Uint8Array {
    const totalLength = arrays.reduce((sum, arr) => sum + arr.length, 0);

    const result = new Uint8Array(totalLength);

    let offset = 0;
    for (const arr of arrays) {
        result.set(arr, offset);
        offset += arr.length;
    }

    return result;
}

// TODO: replace with more efficient approach after writing tests
export function asciiStringToBytes(ascii: string) {
    const bytes = new Uint8Array(ascii.length)
    for (let i = 0; i < bytes.length; i++) {
        const charCode = ascii.charCodeAt(i)
        if (charCode > 255) {
            throw new Error("Only ascii characters are allowed")
        }
        bytes[i] = charCode
    }

    return bytes
}

export function bytesToAsciiString(bytes: Uint8Array) {
    let ascii = ""
    for (const charCode of bytes) {
        if (charCode > 255) {
            throw new Error("Only ascii characters are allowed")
        }

        ascii += String.fromCharCode(charCode)
    }

    return ascii
}

export function bytesToBase64String(bytes: Uint8Array): string {
    return btoa(bytesToAsciiString(bytes))
}

export function base64StringToBytes(base64String: string): Uint8Array {
    return asciiStringToBytes(atob(base64String))
}