package edu.pw.safechat.labyrinth.internal.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

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

    @ManyToOne(optional = false)
    private Labyrinth labyrinth;

    @Column(nullable = false)
    private String sequenceId;

}
