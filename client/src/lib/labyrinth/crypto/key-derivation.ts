import {hkdfSync} from "crypto"
import {KEY_LENGTH_BYTES} from "@/lib/labyrinth/crypto/utils.ts";

export function kdf_one_key(ikm: Buffer, salt: Buffer, info: Buffer, key_length: number = KEY_LENGTH_BYTES) {
    return kdf(ikm, salt, info, key_length)
}

export function kdf_two_keys(ikm: Buffer, salt: Buffer, info: Buffer, first_key_length: number = KEY_LENGTH_BYTES, second_key_length: number = KEY_LENGTH_BYTES ) {
    const full_key = kdf(ikm, salt, info, first_key_length + second_key_length)
    return [
        full_key.subarray(0, first_key_length),
        full_key.subarray(first_key_length)
    ] as const
}

function kdf(ikm: Buffer, salt: Buffer, info: Buffer, key_length: number) {
    return Buffer.from(hkdfSync('sha256', ikm, salt, info, key_length))
}