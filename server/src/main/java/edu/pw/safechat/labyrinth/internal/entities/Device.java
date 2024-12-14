package edu.pw.safechat.labyrinth.internal.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Entity
@Getter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Device {

    @Id
    @GeneratedValue
    private UUID id;

    @ManyToOne
    private Labyrinth labyrinth;

    @Column(nullable = false)
    private byte[] deviceKeyPub;

    @Column(nullable = false)
    private byte[] epochStorageKeyPub;
    @Column(nullable = false)
    private byte[] epochStorageKeySig;

    @Column(nullable = false)
    private byte[] epochStorageAuthKeyPub;
    @Column(nullable = false)
    private byte[] epochStorageAuthKeySig;

}
