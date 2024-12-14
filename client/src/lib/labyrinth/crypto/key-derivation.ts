import { KEY_LENGTH_BYTES } from '@/lib/labyrinth/crypto/keys.ts';
import { concat } from '@/lib/labyrinth/crypto/utils.ts';

export async function kdf_one_key(
    ikm: Uint8Array,
    salt: Uint8Array | null,
    info: Uint8Array,
    key_length: number = KEY_LENGTH_BYTES,
) {
    return hkdfSHA256(ikm, salt, info, key_length);
}

export async function kdf_two_keys(
    ikm: Uint8Array,
    salt: Uint8Array | null,
    info: Uint8Array,
    first_key_length: number = KEY_LENGTH_BYTES,
    second_key_length: number = KEY_LENGTH_BYTES,
) {
    const full_key = await hkdfSHA256(
        ikm,
        salt,
        info,
        first_key_length + second_key_length,
    );
    return [
        full_key.subarray(0, first_key_length),
        full_key.subarray(first_key_length),
    ] as const;
}

const SALT_DEFAULT_LENGTH = 32;
const SHA256_OUTPUT_LENGTH_BYTES = 32;

// implementation based on:
// https://datatracker.ietf.org/doc/html/rfc5869
async function hkdfSHA256(
    ikm: Uint8Array,
    salt: Uint8Array | null,
    info: Uint8Array,
    keyLength: number,
): Promise<Uint8Array> {
    if (salt === null) {
        salt = new Uint8Array(SALT_DEFAULT_LENGTH);
    }

    const hmacKey = await crypto.subtle.importKey(
        'raw',
        salt,
        {
            name: 'HMAC',
            hash: 'SHA-256',
        },
        false,
        ['sign'],
    );
    const pseudoRandomKey = await crypto.subtle.importKey(
        'raw',
        await crypto.subtle.sign('HMAC', hmacKey, ikm),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign'],
    );

    const blocksNeeded = Math.ceil(keyLength / SHA256_OUTPUT_LENGTH_BYTES);
    const output = new Uint8Array(blocksNeeded * SHA256_OUTPUT_LENGTH_BYTES);
    let previousBlock = new Uint8Array(0);

    for (let i = 0; i < blocksNeeded; i++) {
        const block = new Uint8Array(
            await crypto.subtle.sign(
                'HMAC',
                pseudoRandomKey,
                concat(previousBlock, info, Uint8Array.of(i + 1)),
            ),
        );

        output.set(block, i * SHA256_OUTPUT_LENGTH_BYTES);
        previousBlock = block;
    }

    return output.slice(0, keyLength);
}
