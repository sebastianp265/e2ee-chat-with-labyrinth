package edu.pw.chat.labyrinth.common.entities;

import jakarta.persistence.*;
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

    @OneToOne
    @JoinColumn(nullable = false)
    private Epoch epoch;

    @OneToOne
    @JoinColumn(nullable = false)
    private VirtualDevice virtualDevice;

    @Column(nullable = false)
    private byte[] encryptedEpochSequenceID;
    @Column(nullable = false)
    private byte[] encryptedEpochRootKey;
    @Column(nullable = false)
    private byte[] encryptedDeviceKeyPriv;
    @Column(nullable = false)
    private byte[] encryptedEpochStorageKeyPriv;
}
