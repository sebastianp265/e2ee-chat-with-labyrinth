package edu.pw.safechat.labyrinth.dtos.common;

public record VirtualDeviceEncryptedRecoverySecretsDTO(
        byte[] encryptedEpochSequenceId,
        byte[] encryptedEpochRootKey,
        byte[] encryptedDeviceKeyPriv,
        byte[] encryptedEpochStorageKeyPriv
) {
}
