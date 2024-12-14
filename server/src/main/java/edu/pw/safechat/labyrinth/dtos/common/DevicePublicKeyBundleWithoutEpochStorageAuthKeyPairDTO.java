package edu.pw.safechat.labyrinth.dtos.common;

public record DevicePublicKeyBundleWithoutEpochStorageAuthKeyPairDTO(
        byte[] deviceKeyPub,

        byte[] epochStorageKeyPub,
        byte[] epochStorageKeySig
) {
}
