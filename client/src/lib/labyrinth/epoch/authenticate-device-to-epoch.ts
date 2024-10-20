import {kdf_one_key} from "@/lib/labyrinth/crypto/key-derivation.ts";
import {mac} from "@/lib/labyrinth/crypto/message-authentication.ts";
import {Epoch, EpochWithoutID} from "@/lib/labyrinth/epoch/EpochStorage.ts";

export type AuthenticateDeviceToEpochRequestBody = {
    epochDeviceMac: Buffer
}

export type AuthenticateDeviceToEpochWebClient = {
    authenticateDeviceToEpoch: (epochID: string,
                                authenticateDeviceToEpochRequestBody: AuthenticateDeviceToEpochRequestBody) => Promise<void>
}

export function generateEpochDeviceMac(epoch: Epoch | EpochWithoutID,
                                       deviceKeyPub: Buffer) {
    const epochDeviceMacKey = kdf_one_key(
        epoch.rootKey,
        Buffer.alloc(0),
        Buffer.from(`epoch_devices_${Buffer.from(epoch.sequenceID).toString('base64')}`)
    )

    return mac(epochDeviceMacKey, deviceKeyPub)
}
