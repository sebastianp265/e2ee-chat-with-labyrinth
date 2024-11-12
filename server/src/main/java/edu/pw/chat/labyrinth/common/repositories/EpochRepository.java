package edu.pw.chat.labyrinth.common.repositories;

import edu.pw.chat.labyrinth.common.entities.Epoch;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface EpochRepository extends JpaRepository<Epoch, UUID> {
}
