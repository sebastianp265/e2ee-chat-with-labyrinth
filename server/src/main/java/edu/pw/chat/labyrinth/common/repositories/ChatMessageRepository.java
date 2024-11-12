package edu.pw.chat.labyrinth.common.repositories;

import edu.pw.chat.labyrinth.common.entities.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, UUID> {
}
