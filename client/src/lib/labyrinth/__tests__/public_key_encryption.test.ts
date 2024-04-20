import {pk_auth_keygen, pk_decrypt, pk_enc_keygen, pk_encrypt} from "@/lib/labyrinth/crypto/public_key_encryption.ts";
import {KEY_LENGTH_BYTES, random} from "@/lib/labyrinth/crypto/utils.ts";

describe("labyrinth public key encryption", () => {
    test('sender encrypts the message and recipient decrypts it correctly', () => {
        // recipient data
        const {pub_key_enc: recipient_enc_pub, priv_key_enc: recipient_enc_priv} = pk_enc_keygen()
        const psk = random(KEY_LENGTH_BYTES)
        // sender data
        const {pub_key_auth: sender_auth_pub, priv_key_auth: sender_auth_priv} = pk_auth_keygen()

        // sender fetches from the server the same psk recipient has
        // also recipient_enc_pub is fetched

        const aad = random(8)

        // sender prepares the message
        const plaintext = "Hello Alice!"

        const ciphertext = pk_encrypt(recipient_enc_pub, sender_auth_pub, sender_auth_priv, psk, aad, plaintext)
        // ciphertext is sent to recipient
        const decrypted_plaintext = pk_decrypt(recipient_enc_pub, recipient_enc_priv, sender_auth_pub, psk, aad, ciphertext)
        expect(decrypted_plaintext).toBe(plaintext)
    })
})