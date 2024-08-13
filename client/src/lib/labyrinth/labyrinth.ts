import {pk_sig_keygen, pk_sign} from "@/lib/labyrinth/crypto/signing.ts";
import {pk_auth_keygen, pk_enc_keygen} from "@/lib/labyrinth/crypto/public_key_encryption.ts";
import {
    LabyrinthKeyBundle,
    LabyrinthPrivateKeyBundle,
    LabyrinthPublicKeyBundle
} from "@/lib/labyrinth/labyrinth-types.ts";

/**
 * Generates key bundle which consists of:
 * - device keys
 * - epoch storage keys
 * - epoch storage key signature (public key signed by private)
 * - epoch storage auth keys
 * - epoch storage auth key signatures (public key signed by private)
 *
 * @returns key bundle (private and shared parts)
 */
export function generateKeyBundle(): LabyrinthKeyBundle {
    const {priv_key_sig: deviceKeyPriv, pub_key_sig: deviceKeyPub} = pk_sig_keygen()
    const {priv_key_enc: epochStorageKeyPriv, pub_key_enc: epochStorageKeyPub} = pk_enc_keygen()
    const epochStorageKeySig = pk_sign(deviceKeyPriv, Buffer.of(0x30), epochStorageKeyPub.getPublicKeyBytes())

    const {priv_key_auth: epochStorageAuthKeyPriv, pub_key_auth: epochStorageAuthKeyPub} = pk_auth_keygen()
    const epochStorageAuthKeySig = pk_sign(deviceKeyPriv, Buffer.of(0x31), epochStorageAuthKeyPub.getPublicKeyBytes())

    const privateKeyBundle: LabyrinthPrivateKeyBundle = {
        deviceKeyPriv,
        epochStorageAuthKeyPriv,
        epochStorageKeyPriv
    }

    const sharedKeyBundle: LabyrinthPublicKeyBundle = {
        deviceKeyPub,
        epochStorageAuthKeyPub,
        epochStorageAuthKeySig,
        epochStorageKeyPub,
        epochStorageKeySig
    }

    return {
        private: privateKeyBundle,
        public: sharedKeyBundle
    }
}