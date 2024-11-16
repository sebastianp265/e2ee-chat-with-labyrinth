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
public class VirtualDeviceEpochMembershipProof {

    @Id
    @GeneratedValue
    private Long id;

    @ManyToOne
    @JoinColumn(nullable = false)
    private VirtualDevice virtualDevice;

    @Column(nullable = false)
    private byte[] epochDeviceMac;
}
