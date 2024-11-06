import {cryptoAssert} from "@/lib/labyrinth/crypto/utils.ts";
import {ed25519, edwardsToMontgomeryPriv, edwardsToMontgomeryPub, x25519} from "@noble/curves/ed25519";

export function generate_key_pair() {
    const privateKey = PrivateKey.generate()
    const publicKey = privateKey.getPublicKey()
    return {privateKey, publicKey}
}

export const KEY_LENGTH_BYTES = 32

export class PrivateKey {
    // ed25519 private key
    private readonly ed25519PrivateKey: Uint8Array

    public constructor(ed25519PrivateKey: Uint8Array) {
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
    public serialize(): Uint8Array {
        return this.ed25519PrivateKey
    }

    // used for persistence only
    public static deserialize(serialized: Uint8Array): PrivateKey {
        return new PrivateKey(serialized)
    }

    public sign(message: Uint8Array): Uint8Array {
        return ed25519.sign(message, this.ed25519PrivateKey)
    }

    public agree(otherKey: PublicKey): Uint8Array {
        const x25519PrivateKey = edwardsToMontgomeryPriv(this.ed25519PrivateKey)
        const x25519OtherPublicKey = otherKey.getPublicKeyBytes()
        return x25519.getSharedSecret(x25519PrivateKey, x25519OtherPublicKey)
    }

}

export class PublicKey {
    // ed25519 public key
    private readonly ed25519PublicKey: Uint8Array

    public constructor(ed25519PublicKey: Uint8Array) {
        cryptoAssert(ed25519PublicKey.length === KEY_LENGTH_BYTES)
        this.ed25519PublicKey = ed25519PublicKey
    }

    // used for persistence only
    public serialize(): Uint8Array {
        return this.ed25519PublicKey
    }

    // used for persistence only
    public static deserialize(serialized: Uint8Array): PublicKey {
        return new PublicKey(serialized)
    }

    // returns x25519 public key bytes
    public getPublicKeyBytes(): Uint8Array {
        const x25519PublicKey = edwardsToMontgomeryPub(this.ed25519PublicKey)
        cryptoAssert(x25519PublicKey.length === KEY_LENGTH_BYTES)

        return x25519PublicKey
    }

    public verify(message: Uint8Array, signature: Uint8Array): boolean {
        return ed25519.verify(signature, message, this.ed25519PublicKey)
    }

}