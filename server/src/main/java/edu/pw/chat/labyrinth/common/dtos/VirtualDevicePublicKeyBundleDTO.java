package edu.pw.chat.labyrinth.common.dtos;

public record VirtualDevicePublicKeyBundleDTO(
        byte[] deviceKeyPub,

        byte[] epochStorageKeyPub,
        byte[] epochStorageKeySig
) {
}
