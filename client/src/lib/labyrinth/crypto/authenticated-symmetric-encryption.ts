import {concat, random} from "@/lib/labyrinth/crypto/utils.ts";

export const NONCE_LENGTH = 12

export async function encrypt(key: Uint8Array, aad: Uint8Array, plaintext: Uint8Array) {
    const nonce = random(NONCE_LENGTH)
    return aes_gcm_256_encrypt(key, nonce, aad, plaintext)
}

export async function decrypt(key: Uint8Array, aad: Uint8Array, ciphertext: Uint8Array) {
    return aes_gcm_256_decrypt(key, aad, ciphertext)
}

export async function aes_gcm_256_encrypt(key: Uint8Array, nonce: Uint8Array, aad: Uint8Array, plaintext: Uint8Array) {
    const crypto_key = await crypto.subtle.importKey(
        "raw",
        key,
        {name: "AES-GCM"},
        false,
        ["encrypt"],
    );

    const ciphertext = await crypto.subtle.encrypt(
        {
            name: "AES-GCM",
            iv: nonce,
            additionalData: aad,
            tagLength: 128,
        },
        crypto_key,
        plaintext,
    );

    return concat(
        nonce,
        new Uint8Array(ciphertext),
    )
}

export async function aes_gcm_256_decrypt(key: Uint8Array, aad: Uint8Array, ciphertext: Uint8Array) {
    const nonce = ciphertext.subarray(0, NONCE_LENGTH);
    const encryptedData = ciphertext.subarray(NONCE_LENGTH);

    // Import the key as a CryptoKey object
    const crypto_key = await crypto.subtle.importKey(
        "raw",
        key,
        { name: "AES-GCM" },
        false,
        ["decrypt"],
    );

    const plaintext = await crypto.subtle.decrypt(
        {
            name: "AES-GCM",
            iv: nonce,
            additionalData: aad,
            tagLength: 128,
        },
        crypto_key,
        encryptedData,
    );

    return new Uint8Array(plaintext);
}

