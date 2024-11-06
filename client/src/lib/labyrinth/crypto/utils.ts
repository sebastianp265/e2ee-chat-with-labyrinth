export function random(numberOfBytes: number) {
    const buffer = new Uint8Array(numberOfBytes);
    crypto.getRandomValues(buffer);
    return buffer
}

export function cryptoAssert(expression: boolean) {
    if(!expression) throw new CryptoAssertionError();
}

export class CryptoAssertionError extends Error {

    public constructor() {
        super();

        Object.setPrototypeOf(this, CryptoAssertionError);
    }
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

const textEncoder = new TextEncoder()

export function encode(decoded: string) {
    return textEncoder.encode(decoded)
}

const textDecoder = new TextDecoder()

export function decode(encoded: Uint8Array) {
    return textDecoder.decode(encoded)
}

export function encodeToBase64(str: string) {
    return btoa(str)
}

export function decodeFromBase64(base64: string) {
    return atob(base64)
}