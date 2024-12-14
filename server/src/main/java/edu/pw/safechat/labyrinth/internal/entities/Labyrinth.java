package edu.pw.safechat.labyrinth.internal.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
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
public class Labyrinth {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(nullable = false)
    private UUID chatInboxId;

}
