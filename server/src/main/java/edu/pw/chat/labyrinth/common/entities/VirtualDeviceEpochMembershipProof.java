package edu.pw.chat.labyrinth.common.entities;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class VirtualDeviceEpochMembershipProof {

    @Id
    @GeneratedValue
    private Long id;

    @OneToOne
    private Epoch epoch;

    @ManyToOne
    @JoinColumn(nullable = false)
    private VirtualDevice virtualDevice;

    @Column(nullable = false)
    private byte[] epochDeviceMac;
}
