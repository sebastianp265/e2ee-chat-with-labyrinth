import {kdf_one_key} from "@/lib/labyrinth/crypto/key-derivation.ts";
import {mac} from "@/lib/labyrinth/crypto/message-authentication.ts";
import {Epoch, EpochWithoutID} from "@/lib/labyrinth/epoch/EpochStorage.ts";
import {PublicKey} from "@/lib/labyrinth/crypto/keys.ts";
import {encode, encodeToBase64} from "@/lib/labyrinth/crypto/utils.ts";

export type AuthenticateDeviceToEpochRequestBody = {
    epochDeviceMac: Uint8Array
}

export type AuthenticateDeviceToEpochWebClient = {
    authenticateDeviceToEpoch: (epochID: string,
                                authenticateDeviceToEpochRequestBody: AuthenticateDeviceToEpochRequestBody) => Promise<void>
}

export async function generateEpochDeviceMac(epoch: Epoch | EpochWithoutID,
                                             deviceKeyPub: PublicKey) {
    const epochDeviceMacKey = await kdf_one_key(
        epoch.rootKey,
        Uint8Array.of(),
        encode(`epoch_devices_${encodeToBase64(epoch.sequenceID)}`)
    )

    return mac(epochDeviceMacKey, deviceKeyPub.getPublicKeyBytes())
}
