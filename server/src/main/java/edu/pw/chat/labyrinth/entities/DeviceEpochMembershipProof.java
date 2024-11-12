package edu.pw.chat.labyrinth.entities;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class DeviceEpochMembershipProof {

    @Id
    @GeneratedValue
    private Long id;

    @ManyToOne
    private Epoch epoch;

    @ManyToOne
    @JoinColumn(nullable = false)
    private Device device;

    @Column(nullable = false)
    private byte[] epochDeviceMac;

}
