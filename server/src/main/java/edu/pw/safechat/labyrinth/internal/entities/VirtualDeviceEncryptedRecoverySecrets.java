package edu.pw.safechat.labyrinth.internal.entities;

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
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    private Labyrinth labyrinth;

    @OneToOne(optional = false)
    private VirtualDevice virtualDevice;

    @OneToOne(optional = false)
    private Epoch epoch;

    @Column(nullable = false)
    private byte[] encryptedEpochSequenceId;
    @Column(nullable = false)
    private byte[] encryptedEpochRootKey;
    @Column(nullable = false)
    private byte[] encryptedDeviceKeyPriv;
    @Column(nullable = false)
    private byte[] encryptedEpochStorageKeyPriv;
}
