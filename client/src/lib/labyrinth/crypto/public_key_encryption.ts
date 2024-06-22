import {PrivateKey, PublicKey} from "@signalapp/libsignal-client";
import {generate_x25519_keypair, KEY_LENGTH_BYTES} from "@/lib/labyrinth/crypto/utils.ts";
import {kdf_one_key} from "@/lib/labyrinth/crypto/key_derivation.ts";
import {
    aes_gcm_256_decrypt,
    aes_gcm_256_encrypt,
    NONCE_LENGTH
} from "@/lib/labyrinth/crypto/authenticated_symmetric_encryption.ts";

// labyrinth hpke encrypt (public key encryption)
export function pk_encrypt(
    recipient_enc_pub: PublicKey,
    sender_auth_pub: PublicKey,
    sender_auth_priv: PrivateKey,
    psk: Buffer,
    aad: Buffer,
    plaintext: Buffer
) {
    if (psk.length > 32) {
        throw Error("Pre-shared key must be at max 32 bytes long")
    }

    const {pub_key: pub_ephem, priv_key: priv_ephem} = generate_x25519_keypair()
    const id_id = sender_auth_priv.agree(recipient_enc_pub)
    const id_ephem = priv_ephem.agree(recipient_enc_pub)

    const fresh_secret = Buffer.concat([id_id, id_ephem])
    const inner_aad = Buffer.concat([
        Buffer.of(0x01),
        sender_auth_pub.getPublicKeyBytes(),
        recipient_enc_pub.getPublicKeyBytes(),
        pub_ephem.getPublicKeyBytes(),
        aad
    ])

    const subkey = kdf_one_key(fresh_secret, psk, inner_aad)
    const nonce = Buffer.alloc(NONCE_LENGTH, 0)
    const ciphertext = aes_gcm_256_encrypt(Buffer.from(subkey), nonce, aad, plaintext)
    return Buffer.concat([
        Buffer.of(0x01),
        pub_ephem.serialize(),
        ciphertext
    ])
}

export function pk_decrypt(
    recipient_enc_pub: PublicKey,
    recipient_enc_priv: PrivateKey,
    sender_auth_pub: PublicKey,
    psk: Buffer,
    aad: Buffer,
    ciphertext: Buffer
) {
    if (psk.length > 32) {
        throw Error("Pre-shared key must be at max 32 bytes long")
    }
    const use_case_byte = ciphertext.subarray(0, 1)
    if (use_case_byte.length != 1 && use_case_byte[0] != 0x01) {
        throw Error("Invalid use case byte")
    }
    // serialized key takes 33 bytes
    const pub_ephem = PublicKey.deserialize(ciphertext.subarray(1, 1 + KEY_LENGTH_BYTES + 1))
    ciphertext = ciphertext.subarray(1 + KEY_LENGTH_BYTES + 1)

    const id_id = recipient_enc_priv.agree(sender_auth_pub)
    const id_ephem = recipient_enc_priv.agree(pub_ephem)

    const fresh_secret = Buffer.concat([id_id, id_ephem])
    const inner_aad = Buffer.concat([
        Buffer.of(0x01),
        sender_auth_pub.getPublicKeyBytes(),
        recipient_enc_pub.getPublicKeyBytes(),
        pub_ephem.getPublicKeyBytes(),
        aad
    ])
    const subkey = kdf_one_key(fresh_secret, psk, inner_aad)

    return aes_gcm_256_decrypt(Buffer.from(subkey), aad, ciphertext)
}

export function pk_enc_keygen() {
    const key_pair = generate_x25519_keypair()
    return {priv_key_enc: key_pair.priv_key, pub_key_enc: key_pair.pub_key}
}

export function pk_auth_keygen() {
    const key_pair = generate_x25519_keypair()
    return {priv_key_auth: key_pair.priv_key, pub_key_auth: key_pair.pub_key}
}
