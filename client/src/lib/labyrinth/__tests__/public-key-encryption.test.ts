import {
    pk_auth_keygen,
    pk_decrypt,
    pk_enc_keygen,
    pk_encrypt,
} from '@/lib/labyrinth/crypto/public-key-encryption.ts';
import { encodeText, random } from '@/lib/labyrinth/crypto/utils.ts';
import { KEY_LENGTH_BYTES } from '@/lib/labyrinth/crypto/keys.ts';

describe('labyrinth public key encryption', () => {
    test('sender encrypts the message and recipient decrypts it correctly', async () => {
        // recipient data
        const { publicKey: recipient_enc_pub, privateKey: recipient_enc_priv } =
            pk_enc_keygen();
        const psk = random(KEY_LENGTH_BYTES);
        // sender data
        const { publicKey: sender_auth_pub, privateKey: sender_auth_priv } =
            pk_auth_keygen();

        // sender fetches from the server the same psk recipient has
        // also recipient_enc_pub is fetched

        const aad = random(8);

        // sender prepares the message
        const plaintext = encodeText('Hello Alice!');

        const ciphertext = await pk_encrypt(
            recipient_enc_pub,
            sender_auth_pub,
            sender_auth_priv,
            psk,
            aad,
            plaintext,
        );
        // ciphertext is sent to recipient
        const decrypted_plaintext = await pk_decrypt(
            recipient_enc_pub,
            recipient_enc_priv,
            sender_auth_pub,
            psk,
            aad,
            ciphertext,
        );
        expect(decrypted_plaintext).toEqual(plaintext);
    });
});
