import {bytes_equal, concat, cryptoAssert} from "@/lib/labyrinth/crypto/utils.ts";
import {ed25519, edwardsToMontgomeryPriv, edwardsToMontgomeryPub, x25519} from "@noble/curves/ed25519";
import {BytesSerializer} from "@/lib/labyrinth/BytesSerializer.ts";

export function generate_key_pair() {
    const privateKey = PrivateKey.generate()
    const publicKey = privateKey.getPublicKey()
    return {privateKey, publicKey}
}

export const KEY_LENGTH_BYTES = 32

export class PrivateKey {
    // ed25519 private key
    private readonly ed25519PrivateKey: Uint8Array

    private constructor(ed25519PrivateKey: Uint8Array) {
        cryptoAssert(ed25519PrivateKey.length === KEY_LENGTH_BYTES)
        this.ed25519PrivateKey = ed25519PrivateKey
    }

    public static generate(): PrivateKey {
        return new PrivateKey(ed25519.utils.randomPrivateKey())
    }

    public getPublicKey(): PublicKey {
        return new PublicKey(ed25519.getPublicKey(this.ed25519PrivateKey))
    }

    // used for persistence only
    public serialize(): string {
        return BytesSerializer.serialize(this.ed25519PrivateKey)
    }

    // used for persistence only
    public static deserialize(serialized: string): PrivateKey {
        return new PrivateKey(BytesSerializer.deserialize(serialized))
    }

    public sign(useCaseByte: Uint8Array, data: Uint8Array): Uint8Array {
        cryptoAssert(useCaseByte.length === 1)

        return ed25519.sign(concat(useCaseByte, data), this.ed25519PrivateKey)
    }

    public agree(otherKey: PublicKey): Uint8Array {
        const x25519PrivateKey = edwardsToMontgomeryPriv(this.ed25519PrivateKey)
        const x25519OtherPublicKey = otherKey.getX25519PublicKeyBytes()
        return x25519.getSharedSecret(x25519PrivateKey, x25519OtherPublicKey)
    }

}

export class PublicKey {
    private readonly ed25519PublicKey: Uint8Array

    public constructor(ed25519PublicKey: Uint8Array) {
        cryptoAssert(ed25519PublicKey.length === KEY_LENGTH_BYTES)
        this.ed25519PublicKey = ed25519PublicKey
    }

    public serialize(): string {
        return BytesSerializer.serialize(this.ed25519PublicKey)
    }

    public static deserialize(serialized: string): PublicKey {
        return new PublicKey(BytesSerializer.deserialize(serialized))
    }

    public getEd25519PublicKeyBytes(): Uint8Array {
        return this.ed25519PublicKey
    }

    public getX25519PublicKeyBytes(): Uint8Array {
        const x25519PublicKey = edwardsToMontgomeryPub(this.ed25519PublicKey)
        cryptoAssert(x25519PublicKey.length === KEY_LENGTH_BYTES)

        return x25519PublicKey
    }

    public verify(signature: Uint8Array, useCaseByte: Uint8Array, data: Uint8Array): boolean {
        return ed25519.verify(signature, concat(useCaseByte, data), this.ed25519PublicKey)
    }

    public equals(otherKey: PublicKey): boolean {
        return bytes_equal(this.getX25519PublicKeyBytes(), otherKey.getX25519PublicKeyBytes())
    }

}