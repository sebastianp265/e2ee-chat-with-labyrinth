import {describe, expect, test} from "@jest/globals"
import {decrypt, encrypt} from "@/lib/labyrinth/crypto/authenticated-symmetric-encryption.ts"
import {encode} from "@/lib/labyrinth/crypto/utils.ts";

describe('authenticated symmetric encryption', () => {
    test('should get the same message after encryption and decryption with same keys and aad', async () => {
        const plaintext = encode("Lorem ipsum dolor sit amet, consectetur adipiscing elit." +
            " Pellentesque a odio id mauris condimentum lacinia. Sed nibh nunc, pharetra in vestibulum vel," +
            " iaculis quis nulla. Vivamus maximus lorem dictum, blandit urna vitae, iaculis risus.")
        const key = new Uint8Array(256 / 8)
        crypto.getRandomValues(key)
        const aad = new Uint8Array(8)
        crypto.getRandomValues(aad)

        const ciphertext = await encrypt(key, aad, plaintext)
        const plaintext_after_decryption = await decrypt(key, aad, ciphertext)

        expect(plaintext_after_decryption).toEqual(plaintext)
    })

    test('should throw error when different key is used', async () => {
        const plaintext = encode("Lorem ipsum dolor sit amet, consectetur adipiscing elit." +
            " Pellentesque a odio id mauris condimentum lacinia. Sed nibh nunc, pharetra in vestibulum vel," +
            " iaculis quis nulla. Vivamus maximus lorem dictum, blandit urna vitae, iaculis risus.");
        const key = new Uint8Array(256 / 8);
        crypto.getRandomValues(key);
        const aad = new Uint8Array(8);
        crypto.getRandomValues(aad);

        const ciphertext = await encrypt(key, aad, plaintext);

        // Modify key
        key[key.length / 2] = ~key[key.length / 2];

        // Expect decryption to throw
        await expect(decrypt(key, aad, ciphertext)).rejects.toThrow();
    });

    test('should throw error when different aad is used', async () => {
        const plaintext = encode("Lorem ipsum dolor sit amet, consectetur adipiscing elit." +
            " Pellentesque a odio id mauris condimentum lacinia. Sed nibh nunc, pharetra in vestibulum vel," +
            " iaculis quis nulla. Vivamus maximus lorem dictum, blandit urna vitae, iaculis risus.");
        const key = new Uint8Array(256 / 8);
        crypto.getRandomValues(key);
        const aad = new Uint8Array(8);
        crypto.getRandomValues(aad);

        const ciphertext = await encrypt(key, aad, plaintext);

        // Modify aad
        aad[3] = ~aad[3];

        // Expect decryption to throw
        await expect(decrypt(key, aad, ciphertext)).rejects.toThrow();
    });

})
