package edu.pw.chat.repository;

import edu.pw.chat.entitities.Conversation;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ConversationRepository extends CrudRepository<Conversation, Long> {
}
