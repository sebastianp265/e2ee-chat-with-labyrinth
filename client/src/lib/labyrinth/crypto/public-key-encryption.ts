import {kdf_one_key} from "@/lib/labyrinth/crypto/key-derivation.ts";
import {
    aes_gcm_256_decrypt,
    aes_gcm_256_encrypt,
    NONCE_LENGTH
} from "@/lib/labyrinth/crypto/authenticated-symmetric-encryption.ts";
import {generate_key_pair, KEY_LENGTH_BYTES, PrivateKey, PublicKey} from "@/lib/labyrinth/crypto/keys.ts";
import {concat, cryptoAssert} from "@/lib/labyrinth/crypto/utils.ts";

// labyrinth hpke encrypt (public key encryption)
export async function pk_encrypt(
    recipient_enc_pub: PublicKey,
    sender_auth_pub: PublicKey,
    sender_auth_priv: PrivateKey,
    psk: Uint8Array,
    aad: Uint8Array,
    plaintext: Uint8Array,
) {
    cryptoAssert(psk.length === KEY_LENGTH_BYTES)

    const {publicKey: pub_ephem, privateKey: priv_ephem} = generate_key_pair()
    const id_id = sender_auth_priv.agree(recipient_enc_pub)
    const id_ephem = priv_ephem.agree(recipient_enc_pub)

    const fresh_secret = concat(id_id, id_ephem)
    const inner_aad = concat(
        Uint8Array.of(0x01),
        sender_auth_pub.getX25519PublicKeyBytes(),
        recipient_enc_pub.getX25519PublicKeyBytes(),
        pub_ephem.getX25519PublicKeyBytes(),
        aad,
    )

    const subkey = await kdf_one_key(fresh_secret, psk, inner_aad)
    const nonce = new Uint8Array(NONCE_LENGTH)
    const ciphertext = await aes_gcm_256_encrypt(subkey, nonce, aad, plaintext)
    return concat(
        Uint8Array.of(0x01),
        pub_ephem.getEd25519PublicKeyBytes(),
        ciphertext,
    )
}

export async function pk_decrypt(
    recipient_enc_pub: PublicKey,
    recipient_enc_priv: PrivateKey,
    sender_auth_pub: PublicKey,
    psk: Uint8Array,
    aad: Uint8Array,
    ciphertext: Uint8Array,
) {
    if (psk.length > 32) {
        throw Error("Pre-shared key must be at max 32 bytes long")
    }
    const use_case_byte = ciphertext.subarray(0, 1)
    if (use_case_byte.length != 1 && use_case_byte[0] != 0x01) {
        throw Error("Invalid use case byte")
    }

    const pub_ephem = new PublicKey(ciphertext.subarray(1, 1 + KEY_LENGTH_BYTES))
    ciphertext = ciphertext.subarray(1 + KEY_LENGTH_BYTES)

    const id_id = recipient_enc_priv.agree(sender_auth_pub)
    const id_ephem = recipient_enc_priv.agree(pub_ephem)

    const fresh_secret = concat(id_id, id_ephem)
    const inner_aad = concat(
        Uint8Array.of(0x01),
        sender_auth_pub.getX25519PublicKeyBytes(),
        recipient_enc_pub.getX25519PublicKeyBytes(),
        pub_ephem.getX25519PublicKeyBytes(),
        aad
    )
    const subkey = await kdf_one_key(fresh_secret, psk, inner_aad)

    return aes_gcm_256_decrypt(subkey, aad, ciphertext)
}
