package edu.pw.safechat.chat.internal.repositories;

import edu.pw.safechat.chat.internal.entities.ChatThreadMember;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ChatThreadMemberRepository extends JpaRepository<ChatThreadMember, Long> {
}