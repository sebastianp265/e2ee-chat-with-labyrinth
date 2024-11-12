package edu.pw.chat.labyrinth.common.dtos;

public record DevicePublicKeyBundleDTO(
        byte[] deviceKeyPub,

        byte[] epochStorageKeyPub,
        byte[] epochStorageKeySig,

        byte[] epochStorageAuthKeyPub,
        byte[] epochStorageAuthKeySig
) {
}
