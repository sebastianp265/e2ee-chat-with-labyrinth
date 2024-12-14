import {kdf_one_key} from "@/lib/labyrinth/crypto/key-derivation.ts";
import {mac} from "@/lib/labyrinth/crypto/message-authentication.ts";
import {Epoch, EpochWithoutId} from "@/lib/labyrinth/epoch/EpochStorage.ts";
import {PublicKey} from "@/lib/labyrinth/crypto/keys.ts";
import {asciiStringToBytes} from "@/lib/labyrinth/crypto/utils.ts";

export type AuthenticateDeviceToEpochRequestBody = {
    epochDeviceMac: string
}

export type AuthenticateDeviceToEpochWebClient = {
    authenticateDeviceToEpoch: (epochId: string,
                                authenticateDeviceToEpochRequestBody: AuthenticateDeviceToEpochRequestBody) => Promise<void>
}

export async function generateEpochDeviceMac(epoch: Epoch | EpochWithoutId,
                                             deviceKeyPub: PublicKey) {
    const epochDeviceMacKey = await kdf_one_key(
        epoch.rootKey,
        null,
        // TODO: why in protocol there is base64 encoding?
        asciiStringToBytes(`epoch_devices_${epoch.sequenceId}`)
    )

    return mac(epochDeviceMacKey, deviceKeyPub.getX25519PublicKeyBytes())
}
