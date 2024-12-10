package edu.pw.safechat.labyrinth.internal.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.OneToOne;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class VirtualDevice {

    @Id
    private byte[] id;

    @OneToOne(optional = false)
    private Labyrinth labyrinth;

    @Column(nullable = false)
    private byte[] deviceKeyPub;

    @Column(nullable = false)
    private byte[] epochStorageKeyPub;
    @Column(nullable = false)
    private byte[] epochStorageKeySig;

}
