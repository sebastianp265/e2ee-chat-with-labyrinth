package edu.pw.safechat.labyrinth.internal.repositories;

import edu.pw.safechat.labyrinth.internal.entities.Labyrinth;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface LabyrinthRepository extends JpaRepository<Labyrinth, UUID> {
}