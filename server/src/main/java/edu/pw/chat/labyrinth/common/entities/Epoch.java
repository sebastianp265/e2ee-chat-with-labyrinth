package edu.pw.chat.labyrinth.common.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Entity
@Getter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Epoch {

    @Id
    @GeneratedValue
    private UUID id;

    @ManyToOne
    @JoinColumn(nullable = false)
    private ChatInbox chatInbox;

    @OneToMany(
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    private List<DeviceEpochMembershipProof> deviceEpochMembershipProofs;

    @OneToOne(
            cascade = CascadeType.ALL
    )
    private VirtualDeviceEpochMembershipProof virtualDeviceEpochMembershipProof;

    @Column(nullable = false)
    private String sequenceID;

}
