package edu.pw.safechat.chat.internal.repositories;

import edu.pw.safechat.chat.internal.entities.ChatInbox;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface ChatInboxRepository extends JpaRepository<ChatInbox, UUID> {

    Optional<ChatInbox> findByUserId(UUID userId);
}
