import {hkdfSync} from "crypto"
import {KEY_LENGTH_BYTES} from "@/lib/labyrinth/crypto/utils.ts";

export function kdf_one_key(ikm: Buffer, salt: Buffer, info: Buffer) {
    return kdf(ikm, salt, info, KEY_LENGTH_BYTES)
}

export function kdf_two_keys(ikm: Buffer, salt: Buffer, info: Buffer) {
    const full_key = kdf(ikm, salt, info, KEY_LENGTH_BYTES * 2)
    return [
        full_key.subarray(0, KEY_LENGTH_BYTES),
        full_key.subarray(KEY_LENGTH_BYTES)
    ]
}

function kdf(ikm: Buffer, salt: Buffer, info: Buffer, key_length: number) {
    return Buffer.from(hkdfSync('sha256', ikm, salt, info, key_length))
}