import {
    decryptVirtualDeviceRecoverySecrets,
    VirtualDeviceEncryptedRecoverySecrets,
    VirtualDeviceEncryptedRecoverySecretsSerialized,
} from "@/lib/labyrinth/device/virtual-device/VirtualDeviceEncryptedRecoverySecrets.ts";
import {
    VirtualDeviceKeyBundle,
    VirtualDevicePublicKeyBundle,
    VirtualDevicePublicKeyBundleSerialized,
} from "@/lib/labyrinth/device/key-bundle/VirtualDeviceKeyBundle.ts";
import {BytesSerializer} from "@/lib/labyrinth/BytesSerializer.ts";
import {asciiStringToBytes, random} from "@/lib/labyrinth/crypto/utils.ts";
import {kdf_two_keys} from "@/lib/labyrinth/crypto/key-derivation.ts";

export type GetVirtualDeviceRecoverySecretsResponse = {
    inboxID: string,
    epochID: string,
    virtualDeviceEncryptedRecoverySecrets: VirtualDeviceEncryptedRecoverySecretsSerialized,
    expectedVirtualDevicePublicKeyBundle: VirtualDevicePublicKeyBundleSerialized,
}

export type GetVirtualDeviceRecoverySecretsBody = {
    virtualDeviceID: string
}

export type GetVirtualDeviceRecoverySecretsWebClient = {
    getVirtualDeviceRecoverySecrets: (getVirtualDeviceRecoverySecretsBody: GetVirtualDeviceRecoverySecretsBody) => Promise<GetVirtualDeviceRecoverySecretsResponse>
}

export class VirtualDevice {
    public readonly id: Uint8Array
    public readonly keyBundle: VirtualDeviceKeyBundle

    private constructor(id: Uint8Array, keyBundle: VirtualDeviceKeyBundle) {
        this.id = id
        this.keyBundle = keyBundle
    }

    public static async fromFirstEpoch(userID: string) {
        const recoveryCode = generateRecoveryCode()
        const {
            virtualDeviceID,
            virtualDeviceDecryptionKey
        } = await deriveVirtualDeviceIDAndDecryptionKey(userID, recoveryCode)
        const keyBundle = VirtualDeviceKeyBundle.generate()
        const virtualDevice = new VirtualDevice(virtualDeviceID, keyBundle)

        return {
            virtualDevice,
            virtualDeviceDecryptionKey,
            recoveryCode,
        }
    }

    public static async fromRecoveryCode(userID: string,
                                         recoveryCode: string,
                                         webClient: GetVirtualDeviceRecoverySecretsWebClient) {
        const {
            virtualDeviceID,
            virtualDeviceDecryptionKey
        } = await deriveVirtualDeviceIDAndDecryptionKey(userID, recoveryCode)

        const {
            inboxID,
            epochID,
            virtualDeviceEncryptedRecoverySecrets,
            expectedVirtualDevicePublicKeyBundle,
        } = await webClient.getVirtualDeviceRecoverySecrets({virtualDeviceID: BytesSerializer.serialize(virtualDeviceID)})

        const {
            virtualDeviceKeyBundle,
            epochWithoutID,
        } = await decryptVirtualDeviceRecoverySecrets(
            virtualDeviceDecryptionKey,
            VirtualDeviceEncryptedRecoverySecrets.deserialize(virtualDeviceEncryptedRecoverySecrets),
            VirtualDevicePublicKeyBundle.deserialize(expectedVirtualDevicePublicKeyBundle),
        )

        const epoch = {
            id: epochID,
            ...epochWithoutID
        }

        const virtualDevice = new VirtualDevice(virtualDeviceID, virtualDeviceKeyBundle)

        return {
            virtualDevice,
            epoch,
            inboxID,
        }
    }

}

export const VERSION_NUMBER = 1
export const IDENTIFIER = 0

const ALPHABET = "ACDEFHJKLMNPQRSTUVWXYZ0123456789"

function generateRecoveryCode() {
    const randomBytes = random(34)
    let entropy = ""

    for (const randomByte of randomBytes) {
        entropy += ALPHABET.at(randomByte % 32)
    }

    // TODO: Error correction code not implemented yet - XXXX
    return `${VERSION_NUMBER}${IDENTIFIER}${entropy}XXXX`
}

export class InvalidRecoveryCodeFormatError extends Error {

    constructor(message: string) {
        super(message);

        Object.setPrototypeOf(this, InvalidRecoveryCodeFormatError.prototype);
    }
}

async function deriveVirtualDeviceIDAndDecryptionKey(userID: string, recoveryCode: string) {
    if (recoveryCode.length !== 40) throw new InvalidRecoveryCodeFormatError("Recovery code has to be 40 characters long")

    const ikm = asciiStringToBytes(recoveryCode.slice(3, 37))
    const info = asciiStringToBytes(`BackupRecoveryCode_v${recoveryCode[0]}_${recoveryCode[1]}_${userID}`)

    const [virtualDeviceID, virtualDeviceDecryptionKey] = await kdf_two_keys(
        ikm,
        null,
        info,
        16,
        32
    )

    return {
        virtualDeviceID: virtualDeviceID,
        virtualDeviceDecryptionKey,
    }
}