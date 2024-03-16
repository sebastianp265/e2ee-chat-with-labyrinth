package edu.pw.chat.repository;

import edu.pw.chat.dtos.MessageGetDTO;
import edu.pw.chat.entitities.Message;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends CrudRepository<Message, Long> {

    @Query("SELECT NEW edu.pw.chat.dtos.MessageGetDTO(m.id, m.author.id, m.content) " +
            "FROM Conversation c " +
            "JOIN c.messages m " +
            "WHERE c.id = :conversationId")
    List<MessageGetDTO> findAllMessagesByConversationId(@Param("conversationId") Long conversationId);
}
