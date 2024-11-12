package edu.pw.chat.labyrinth.common.entities;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import lombok.*;

import java.util.UUID;

@Entity
@Getter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ChatThread {

    @Id
    @GeneratedValue
    private UUID id;

    private String name;

}
