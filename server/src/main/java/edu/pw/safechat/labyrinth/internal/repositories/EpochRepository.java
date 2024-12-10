package edu.pw.safechat.labyrinth.internal.repositories;

import edu.pw.safechat.labyrinth.internal.entities.Epoch;
import edu.pw.safechat.labyrinth.internal.entities.Labyrinth;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface EpochRepository extends JpaRepository<Epoch, UUID> {

    Optional<Epoch> findTopByLabyrinthOrderBySequenceIdDesc(Labyrinth labyrinth);
}
