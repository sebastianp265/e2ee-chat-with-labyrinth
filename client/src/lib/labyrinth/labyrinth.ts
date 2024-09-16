import {pk_sig_keygen, pk_sign} from "@/lib/labyrinth/crypto/signing.ts";
import {pk_auth_keygen, pk_enc_keygen} from "@/lib/labyrinth/crypto/public-key-encryption.ts";
import {
    Epoch,
    LabyrinthKeyBundle,
    LabyrinthPrivateKeyBundle,
    LabyrinthPublicKeyBundle,
    PrivateDevice
} from "@/lib/labyrinth/labyrinth-types.ts";
import {kdf_one_key} from "@/lib/labyrinth/crypto/key-derivation.ts";
import {decrypt, encrypt} from "@/lib/labyrinth/crypto/authenticated-symmetric-encryption.ts";
import {EpochStorage} from "@/lib/labyrinth/epoch/EpochStorage.ts";
import {joinEpoch} from "@/lib/labyrinth/epoch/join-epoch.ts";
import labyrinthWebClientImpl from "@/api/labyrinthWebClientImpl.ts";

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

const CIPHER_VERSION = 1

export interface IEncryptedMessage {
    ciphertext: Buffer,
    epochSequenceID: string
}

export function encryptMessage(threadID: string, epochStorage: EpochStorage, plaintext: string): IEncryptedMessage {
    const newestEpoch = epochStorage.getNewestEpoch()

    const messageKey = deriveMessageKey(threadID, newestEpoch)
    return {
        ciphertext: encrypt(messageKey, Buffer.from(`message_thread_${threadID}`), Buffer.from(plaintext)),
        epochSequenceID: newestEpoch.sequenceID
    }
}

export async function decryptMessage(threadID: string,
                                     selfDevice: PrivateDevice,
                                     epochStorage: EpochStorage,
                                     encryptedMessage: IEncryptedMessage) {
    if (!epochStorage.isEpochPresent(encryptedMessage.epochSequenceID)) {
        await joinEpoch(
            selfDevice,
            epochStorage,
            encryptedMessage.epochSequenceID,
            labyrinthWebClientImpl
        )
    }

    const messageKey = deriveMessageKey(threadID, epochStorage.getEpoch(encryptedMessage.epochSequenceID))

    return decrypt(messageKey, Buffer.from(`message_thread_${threadID}`), encryptedMessage.ciphertext).toString()
}

function deriveMessageKey(threadID: string, epoch: Epoch) {
    return kdf_one_key(
        epoch.rootKey,
        Buffer.alloc(0),
        Buffer.from(`message_key_in_epoch_${epoch.sequenceID}_cipher_version_${CIPHER_VERSION}_${threadID}`)
    )
}