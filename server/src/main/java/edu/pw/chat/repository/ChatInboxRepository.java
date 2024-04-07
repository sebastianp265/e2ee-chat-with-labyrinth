package edu.pw.chat.repository;

import edu.pw.chat.entitities.ChatInbox;
import org.springframework.data.repository.CrudRepository;

import java.util.Optional;

public interface ChatInboxRepository extends CrudRepository<ChatInbox, Long> {

    Optional<ChatInbox> findChatInboxByOwner_Username(String username);
}
