import {hkdfSync} from "crypto"
import {KEY_LENGTH_BYTES} from "@/lib/labyrinth/crypto/utils.ts";

export function kdf(ikm: Buffer, salt: Buffer, info: Buffer) {
    return hkdfSync('sha256', ikm, salt, info, KEY_LENGTH_BYTES)
}