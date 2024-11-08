package edu.pw.chat.labyrinth.entities;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Entity
@Getter
@Builder
@RequiredArgsConstructor
@AllArgsConstructor
public class VirtualDeviceEpochMembershipProof {

    @Id
    @GeneratedValue
    private Long id;

    @ManyToOne
    private VirtualDevice device;

    private byte[] epochDeviceMac;
}
