package edu.pw.safechat.labyrinth.dtos.common;

public record VirtualDevicePublicKeyBundleDTO(
        byte[] deviceKeyPub,

        byte[] epochStorageKeyPub,
        byte[] epochStorageKeySig
) {
}
