import { generate_key_pair } from '@/lib/labyrinth/crypto/keys.ts';
import { asciiStringToBytes } from '@/lib/labyrinth/crypto/utils.ts';
import { describe, expect, test } from 'vitest';

describe('signing data with montgomery curve keypair', () => {
    test('should verify correctly after signing random message', () => {
        const { publicKey, privateKey } = generate_key_pair();

        const use_case_byte = Uint8Array.of(0xff);
        const data = asciiStringToBytes('Some data');

        const signature = privateKey.sign(use_case_byte, data);
        const is_valid = publicKey.verify(signature, use_case_byte, data);
        expect(is_valid).toBeTruthy();
    });

    test('should not be verified if signature was modified', () => {
        const { publicKey, privateKey } = generate_key_pair();

        const use_case_byte = Uint8Array.of(0xff);
        const data = asciiStringToBytes('Some data');

        const signature = privateKey.sign(use_case_byte, data);
        // modifying signature
        signature[21] = ~signature[21];

        const is_valid = publicKey.verify(signature, use_case_byte, data);
        expect(is_valid).toBeFalsy();
    });
});
