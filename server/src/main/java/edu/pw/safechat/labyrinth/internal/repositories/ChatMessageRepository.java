package edu.pw.safechat.labyrinth.internal.repositories;

import edu.pw.safechat.labyrinth.internal.entities.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, UUID> {

    @Query(value = """
                SELECT DISTINCT ON (thread_id) *
                FROM chat_message
                WHERE inbox_id = :inboxId
                ORDER BY thread_id, timestamp DESC
            """, nativeQuery = true)
    List<ChatMessage> findLatestMessagePerThreadByInboxId(UUID inboxId);
}
