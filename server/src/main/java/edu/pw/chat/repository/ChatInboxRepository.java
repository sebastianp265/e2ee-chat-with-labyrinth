package edu.pw.chat.repository;

import edu.pw.chat.entitities.ChatInbox;
import org.springframework.data.repository.CrudRepository;

import java.util.Optional;

public interface ChatInboxRepository extends CrudRepository<ChatInbox, Long> {

    Optional<ChatInbox> findByOwner_Username(String username);

    Optional<ChatInbox> findByOwner_Id(Long id);
}
