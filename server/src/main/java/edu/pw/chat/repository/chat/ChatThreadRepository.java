package edu.pw.chat.repository.chat;

import edu.pw.chat.entitities.chat.ChatThread;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ChatThreadRepository extends CrudRepository<ChatThread, Long> {


}
