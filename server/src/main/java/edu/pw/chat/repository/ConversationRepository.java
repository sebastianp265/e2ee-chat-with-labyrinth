package edu.pw.chat.repository;

import edu.pw.chat.dtos.ConversationPreviewGetDTO;
import edu.pw.chat.entitities.ChatUser;
import edu.pw.chat.entitities.Conversation;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.Set;

@Repository
public interface ConversationRepository extends CrudRepository<Conversation, Long> {

    @Query("SELECT NEW edu.pw.chat.dtos.ConversationPreviewGetDTO(c.id, c.name, m.content, m.author.name) " +
            "FROM Conversation c " +
            "JOIN c.members u " +
            "LEFT JOIN c.messages m " +
            "WHERE u.name = :username " +
            "AND m.sentAt = (SELECT MAX(m2.sentAt) FROM c.messages m2)")
    List<ConversationPreviewGetDTO> findConversationPreviewsForUsername(@Param("username") String username);

    @Query("SELECT (u.name) " +
            "FROM Conversation c " +
            "JOIN c.members u " +
            "WHERE c.id = :conversationId " +
            "AND u.name <> :loggedUsername")
    Optional<String> getNonGroupConversationName(@Param("conversationId") Long conversationId,
                                                 @Param("loggedUsername") String loggedUsername);

    @Query("SELECT COUNT(c) > 0 " +
            "FROM Conversation c " +
            "JOIN c.members m " +
            "WHERE c.id = :conversationId AND m.name = :username")
    boolean isUserAMemberOfConversation(@Param("conversationId") Long conversationId,
                                        @Param("username") String username);

    @Query("SELECT c.members " +
            "FROM Conversation c " +
            "WHERE c.id = :conversationId")
    Set<ChatUser> getChatMembersByConversationId(@Param("conversationId") Long conversationId);
}
