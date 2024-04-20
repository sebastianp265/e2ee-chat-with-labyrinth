import {Aes256GcmSiv} from "@signalapp/libsignal-client"
import {random} from "@/lib/labyrinth/crypto/utils.ts";

export const NONCE_LENGTH = 12

export function encrypt(key: Buffer, aad: Buffer, plaintext: string) {
    const nonce = random(NONCE_LENGTH)
    return aes_gcm_256_encrypt(key, nonce, aad, plaintext)
}

export function decrypt(key: Buffer, aad: Buffer, ciphertext: Buffer) {
    return aes_gcm_256_decrypt(key, aad, ciphertext)
}

export function aes_gcm_256_encrypt(key: Buffer, nonce: Buffer, aad: Buffer, plaintext: string) {
    const aes = Aes256GcmSiv.new(key)

    return Buffer.concat([
        nonce,
        aes.encrypt(Buffer.from(plaintext), nonce, aad)
    ])
}

export function aes_gcm_256_decrypt(key: Buffer, aad: Buffer, ciphertext: Buffer) {
    const aes = Aes256GcmSiv.new(key)
    const nonce = ciphertext.subarray(0, NONCE_LENGTH)
    const decrypted = aes.decrypt(ciphertext.subarray(NONCE_LENGTH), nonce, aad)
    return decrypted.toString()
}

