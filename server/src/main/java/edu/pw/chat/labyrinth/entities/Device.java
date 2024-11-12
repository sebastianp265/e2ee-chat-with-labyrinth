package edu.pw.chat.labyrinth.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import lombok.*;

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
