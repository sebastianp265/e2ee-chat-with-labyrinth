import {PrivateKey, PublicKey} from "@signalapp/libsignal-client";
import {generate_x25519_keypair} from "@/lib/labyrinth/crypto/utils.ts";
import {kdf} from "@/lib/labyrinth/crypto/key_derivation.ts";
import {aes_gcm_256_encrypt, NONCE_LENGTH} from "@/lib/labyrinth/crypto/authenticated_symmetric_encryption.ts";

export function labyrinth_hpke_encrypt(
    recipient_enc_pub: PublicKey,
    sender_auth_pub: PublicKey,
    sender_auth_priv: PrivateKey,
    psk: Buffer,
    aad: Buffer,
    plaintext: string
) {
    if (psk.length <= 32) {
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
        aad]
    )

    const subkey = kdf(fresh_secret, psk, inner_aad)
    const nonce = Buffer.alloc(NONCE_LENGTH, 0)
    const ciphertext = aes_gcm_256_encrypt(Buffer.from(subkey), nonce, aad, plaintext)
    return Buffer.concat([
        Buffer.of(0x01),
        pub_ephem.getPublicKeyBytes(),
        ciphertext
    ])
}