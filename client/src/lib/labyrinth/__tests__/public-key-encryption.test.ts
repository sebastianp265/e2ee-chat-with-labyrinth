import {
    labyrinth_hpke_decrypt,
    labyrinth_hpke_encrypt,
} from '@/lib/labyrinth/crypto/public-key-encryption.ts';
import { asciiStringToBytes, random } from '@/lib/labyrinth/crypto/utils.ts';
import {
    generate_key_pair,
    KEY_LENGTH_BYTES,
} from '@/lib/labyrinth/crypto/keys.ts';
import { expect, test } from 'vitest';

test('sender encrypts the message and recipient decrypts it correctly', async () => {
    // psk is shared before encryption
    const psk = random(KEY_LENGTH_BYTES);

    // recipient encryption key pair
    const { publicKey: recipient_enc_pub, privateKey: recipient_enc_priv } =
        generate_key_pair();

    // sender authorization key pair
    const { publicKey: sender_auth_pub, privateKey: sender_auth_priv } =
        generate_key_pair();
    const aad = random(8);

    // operations on sender side
    const plaintext = asciiStringToBytes('Hello Alice!');
    const ciphertext = await labyrinth_hpke_encrypt(
        recipient_enc_pub,
        sender_auth_pub,
        sender_auth_priv,
        psk,
        aad,
        plaintext,
    );

    // operation on recipient side
    const decrypted_plaintext = await labyrinth_hpke_decrypt(
        recipient_enc_pub,
        recipient_enc_priv,
        sender_auth_pub,
        psk,
        aad,
        ciphertext,
    );

    expect(decrypted_plaintext).toEqual(plaintext);
});
