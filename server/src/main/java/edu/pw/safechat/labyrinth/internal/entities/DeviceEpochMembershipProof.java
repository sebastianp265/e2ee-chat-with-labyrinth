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
public class DeviceEpochMembershipProof {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    private Epoch epoch;

    @ManyToOne(optional = false)
    private Device device;

    @Column(nullable = false)
    private byte[] epochDeviceMac;

}
