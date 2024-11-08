package edu.pw.chat.labyrinth.entities;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

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

    private UUID userID;
}
