import {pk_sig_keygen, pk_sign, pk_verify} from "@/lib/labyrinth/crypto/signing.ts";

describe('signing data with montgomery curve keypair', () => {
    test('should verify correctly after signing random message', () => {
        const {pub_key_sig, priv_key_sig} = pk_sig_keygen()

        const use_case_byte = Buffer.from([0xFF])
        const data = Buffer.from("Some data")

        const signature = pk_sign(priv_key_sig, use_case_byte, data)
        const is_valid = pk_verify(pub_key_sig, signature, use_case_byte, data)
        expect(is_valid).toBeTruthy()
    })

    test('should not be verified if signature was modified', () => {
        const {pub_key_sig, priv_key_sig} = pk_sig_keygen()

        const use_case_byte = Buffer.from([0xFF])
        const data = Buffer.from("Some data")

        const signature = pk_sign(priv_key_sig, use_case_byte, data)
        // modifying signature
        signature[21] = ~signature[21]

        const is_valid = pk_verify(pub_key_sig, signature, use_case_byte, data)
        expect(is_valid).toBeFalsy()
    })
})