package edu.pw.chat.labyrinth.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

import java.util.List;
import java.util.UUID;

@Entity
@Getter
@Builder
@RequiredArgsConstructor
@AllArgsConstructor
public class ChatInbox {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(nullable = false)
    private UUID userID;

//    @OneToOne
//    @JoinColumn(nullable = false)
//    private VirtualDevice virtualDevice;
//
//    @OneToMany
//    @Column(nullable = false)
//    private List<Device> devices;

}
