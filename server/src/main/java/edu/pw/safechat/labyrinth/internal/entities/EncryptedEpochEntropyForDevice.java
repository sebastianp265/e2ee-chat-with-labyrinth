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
public class EncryptedEpochEntropyForDevice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(nullable = false)
    private Device recipientDevice;

    @ManyToOne
    @JoinColumn(nullable = false)
    private Device senderDevice;

    @ManyToOne
    @JoinColumn(nullable = false)
    private Epoch epoch;

    @Column(nullable = false)
    byte[] encryptedEpochEntropy;
}
