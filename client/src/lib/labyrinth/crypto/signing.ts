import {PrivateKey, PublicKey} from "@signalapp/libsignal-client"
import {generate_x25519_keypair} from "@/lib/labyrinth/crypto/utils.ts";

export function pk_sig_keygen() {
    const keypair = generate_x25519_keypair()
    return {priv_key_sig: keypair.priv_key, pub_key_sig: keypair.pub_key}
}

function assert_valid_use_case_byte(use_case_byte: Buffer) {
    if (use_case_byte.length != 1) {
        throw new Error("Buffer with use_case_byte doesn't have exactly one byte")
    }
}

export function pk_sign(priv_key: PrivateKey,
                        use_case_byte: Buffer,
                        data: Buffer) {
    assert_valid_use_case_byte(use_case_byte)

    return priv_key.sign(Buffer.concat([use_case_byte, data]))
}

export function pk_verify(pub_key: PublicKey,
                          signature: Buffer,
                          use_case_byte: Buffer,
                          data: Buffer) {
    assert_valid_use_case_byte(use_case_byte)

    return pub_key.verify(Buffer.concat([use_case_byte, data]), signature)
}