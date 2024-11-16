package edu.pw.chat.labyrinth.common.dtos;

public record DevicePublicKeyBundleWithoutEpochStorageAuthKeyPairDTO(
        byte[] deviceKeyPub,

        byte[] epochStorageKeyPub,
        byte[] epochStorageKeySig
) {
}
