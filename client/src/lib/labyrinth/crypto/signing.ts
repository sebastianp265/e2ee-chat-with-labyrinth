import {concat, cryptoAssert} from "@/lib/labyrinth/crypto/utils.ts";
import {generate_key_pair, PrivateKey, PublicKey} from "@/lib/labyrinth/crypto/keys.ts";

export function pk_sig_keygen() {
    return generate_key_pair()
}

export function pk_sign(priv_key: PrivateKey,
                        use_case_byte: Uint8Array,
                        data: Uint8Array) {
    cryptoAssert(use_case_byte.length === 1)

    return priv_key.sign(concat(use_case_byte, data))
}

export function pk_verify(pub_key: PublicKey,
                          signature: Uint8Array,
                          use_case_byte: Uint8Array,
                          data: Uint8Array) {
    cryptoAssert(use_case_byte.length === 1)

    return pub_key.verify(concat(use_case_byte, data), signature)
}