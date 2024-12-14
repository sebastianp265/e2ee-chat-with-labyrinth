package edu.pw.safechat.chat.internal.repositories;

import edu.pw.safechat.chat.internal.entities.ChatThread;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ChatThreadRepository extends JpaRepository<ChatThread, UUID> {
}