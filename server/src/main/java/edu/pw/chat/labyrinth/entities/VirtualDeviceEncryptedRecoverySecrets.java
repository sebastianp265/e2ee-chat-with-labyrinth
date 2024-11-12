package edu.pw.chat.labyrinth.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class VirtualDeviceEncryptedRecoverySecrets {
    @Id
    @GeneratedValue
    private Long id;

    @Column(nullable = false)
    private byte[] encryptedEpochSequenceID;
    @Column(nullable = false)
    private byte[] encryptedEpochRootKey;
    @Column(nullable = false)
    private byte[] encryptedDeviceKeyPriv;
    @Column(nullable = false)
    private byte[] encryptedEpochStorageKeyPriv;
}
