package edu.pw.chat.labyrinth.entities;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import lombok.*;

import java.util.UUID;

@Entity
@Getter
@Builder
@RequiredArgsConstructor
@AllArgsConstructor
public class ChatThread {

    @Id
    @GeneratedValue
    private UUID id;

    private String name;

}
