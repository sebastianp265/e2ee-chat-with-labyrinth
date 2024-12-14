import {
    base64StringToBytes,
    bytesToBase64String,
} from '@/lib/labyrinth/crypto/utils.ts';

export class BytesSerializer {
    public static readonly serialize = (bytes: Uint8Array) =>
        bytesToBase64String(bytes);

    public static readonly deserialize = (serialized: string) =>
        base64StringToBytes(serialized);
}
