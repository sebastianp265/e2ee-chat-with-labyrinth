package edu.pw.safechat.labyrinth.dtos.common;

public record DevicePublicKeyBundleDTO(
        byte[] deviceKeyPub,

        byte[] epochStorageKeyPub,
        byte[] epochStorageKeySig,

        byte[] epochStorageAuthKeyPub,
        byte[] epochStorageAuthKeySig
) {
}
