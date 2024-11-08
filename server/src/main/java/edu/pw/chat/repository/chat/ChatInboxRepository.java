package edu.pw.chat.repository.chat;

import edu.pw.chat.entitities.chat.ChatInbox;
import org.springframework.data.repository.CrudRepository;

import java.util.Optional;

public interface ChatInboxRepository extends CrudRepository<ChatInbox, Long> {

    Optional<ChatInbox> findByOwner_Id(Long id);
}
