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
public class VirtualDevice {

    @Id
    private String id;

    @OneToOne
    @JoinColumn(nullable = false)
    private ChatInbox chatInbox;

    @Column(nullable = false)
    private byte[] deviceKeyPub;

    @Column(nullable = false)
    private byte[] epochStorageKeyPub;
    @Column(nullable = false)
    private byte[] epochStorageKeySig;

}
