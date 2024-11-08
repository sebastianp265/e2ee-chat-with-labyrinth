package edu.pw.chat.labyrinth.repository.chat;

import edu.pw.chat.labyrinth.entities.ChatInbox;
import org.springframework.data.repository.CrudRepository;

import java.util.Optional;
import java.util.UUID;

public interface ChatInboxRepository extends CrudRepository<ChatInbox, UUID> {

    Optional<ChatInbox> findByUserID(UUID userId);
}
