package edu.pw.chat.labyrinth.common.repositories;

import edu.pw.chat.labyrinth.common.entities.ChatInbox;
import org.springframework.data.repository.CrudRepository;

import java.util.Optional;
import java.util.UUID;

public interface ChatInboxRepository extends CrudRepository<ChatInbox, UUID> {

    Optional<ChatInbox> findByUserID(UUID userId);

    boolean existsByUserID(UUID userID);
}
