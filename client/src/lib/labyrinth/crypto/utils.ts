import {PrivateKey} from "@signalapp/libsignal-client"

export const KEY_LENGTH_BYTES = 32

export function generate_x25519_keypair() {
    const priv_key = PrivateKey.generate()
    const pub_key = priv_key.getPublicKey()
    return {priv_key, pub_key}
}

export function random(bytes: number) {
    const buffer = Buffer.alloc(bytes)
    crypto.getRandomValues(buffer)
    return buffer
}