import {
    pk_sig_keygen,
    pk_sign,
    pk_verify,
} from '@/lib/labyrinth/crypto/signing.ts';

describe('signing data with montgomery curve keypair', () => {
    test('should verify correctly after signing random message', () => {
        const { publicKey, privateKey } = pk_sig_keygen();

        const use_case_byte = Uint8Array.of(0xff);
        const data = encodeText('Some data');

        const signature = pk_sign(privateKey, use_case_byte, data);
        const is_valid = pk_verify(publicKey, signature, use_case_byte, data);
        expect(is_valid).toBeTruthy();
    });

    test('should not be verified if signature was modified', () => {
        const { publicKey, privateKey } = pk_sig_keygen();

        const use_case_byte = Uint8Array.of(0xff);
        const data = encodeText('Some data');

        const signature = pk_sign(privateKey, use_case_byte, data);
        // modifying signature
        signature[21] = ~signature[21];

        const is_valid = pk_verify(publicKey, signature, use_case_byte, data);
        expect(is_valid).toBeFalsy();
    });
});
