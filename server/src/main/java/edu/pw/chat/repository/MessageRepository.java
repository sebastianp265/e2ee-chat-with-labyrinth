package edu.pw.chat.repository;

import edu.pw.chat.dtos.MessageGetDTO;
import edu.pw.chat.dtos.ThreadPreviewGetDTO;
import edu.pw.chat.entitities.Message;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends CrudRepository<Message, Long> {

    @Query("select new edu.pw.chat.dtos.ThreadPreviewGetDTO(t.id, t.name, m.messageData, m.author.visibleName) " +
            "from Message m " +
            "join m.inbox i " +
            "join m.thread t " +
            "join t.subscribedInboxes si " +
            "where si.owner.username = :username " +
            "and m.timestamp = (select max(m2.timestamp) from Message m2 where m2.thread.id = t.id)")
    List<ThreadPreviewGetDTO> getPreviewsOfThreadByUsername(@Param("username") String username);

    @Query("select new edu.pw.chat.dtos.MessageGetDTO(m.messageId, m.author.id, m.messageData)" +
            "from Message m " +
            "where m.thread.id = :threadId " +
            "and m.inbox.id = :inboxId " +
            "order by m.timestamp asc")
    List<MessageGetDTO> findAllMessagesByInboxIdAndThreadId(@Param("inboxId") Long inboxId,
                                                            @Param("threadId") Long threadId);
}
