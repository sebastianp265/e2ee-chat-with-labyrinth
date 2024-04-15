import {describe, expect, test} from "@jest/globals"
import {decrypt, encrypt} from "@/lib/labyrinth/crypto/authenticated_symmetric_encryption.ts"
import {LibSignalErrorBase} from "@signalapp/libsignal-client";

describe('authenticated symmetric encryption', () => {
    test('should get the same message after encryption and decryption with same keys and aad', () => {
        const plaintext = "Lorem ipsum dolor sit amet, consectetur adipiscing elit." +
            " Pellentesque a odio id mauris condimentum lacinia. Sed nibh nunc, pharetra in vestibulum vel," +
            " iaculis quis nulla. Vivamus maximus lorem dictum, blandit urna vitae, iaculis risus."
        const key = Buffer.alloc(256 / 8)
        crypto.getRandomValues(key)
        const aad = Buffer.alloc(8)
        crypto.getRandomValues(aad)

        const ciphertext = encrypt(key, aad, plaintext)
        const plaintext_after_decryption = decrypt(key, aad, ciphertext)

        expect(plaintext_after_decryption).toBe(plaintext)
    })

    test('should throw error when different key is used', () => {
        const plaintext = "Lorem ipsum dolor sit amet, consectetur adipiscing elit." +
            " Pellentesque a odio id mauris condimentum lacinia. Sed nibh nunc, pharetra in vestibulum vel," +
            " iaculis quis nulla. Vivamus maximus lorem dictum, blandit urna vitae, iaculis risus."
        const key = Buffer.alloc(256 / 8)
        crypto.getRandomValues(key)
        const aad = Buffer.alloc(8)
        crypto.getRandomValues(aad)

        const ciphertext = encrypt(key, aad, plaintext)

        // modifying key
        key[key.length / 2] = ~key[key.length / 2]

        expect(() => decrypt(key, aad, ciphertext)).toThrowError(LibSignalErrorBase)
    })

    test('should throw error when different aad is used', () => {
        const plaintext = "Lorem ipsum dolor sit amet, consectetur adipiscing elit." +
            " Pellentesque a odio id mauris condimentum lacinia. Sed nibh nunc, pharetra in vestibulum vel," +
            " iaculis quis nulla. Vivamus maximus lorem dictum, blandit urna vitae, iaculis risus."
        const key = Buffer.alloc(256 / 8)
        crypto.getRandomValues(key)
        const aad = Buffer.alloc(8)
        crypto.getRandomValues(aad)

        const ciphertext = encrypt(key, aad, plaintext)

        // modifying aad
        aad[3] = ~aad[3]

        expect(() => decrypt(key, aad, ciphertext)).toThrowError(LibSignalErrorBase)
    })

})
