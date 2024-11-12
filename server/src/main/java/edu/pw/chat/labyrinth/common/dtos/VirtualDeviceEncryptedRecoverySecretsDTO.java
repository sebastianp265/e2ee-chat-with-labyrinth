package edu.pw.chat.labyrinth.common.dtos;

public record VirtualDeviceEncryptedRecoverySecretsDTO(
        byte[] encryptedEpochSequenceID,
        byte[] encryptedEpochRootKey,
        byte[] encryptedDeviceKeyPriv,
        byte[] encryptedEpochStorageKeyPriv
) {
}
