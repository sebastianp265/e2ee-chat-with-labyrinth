package edu.pw.chat.repository;

import edu.pw.chat.dtos.ChatMemberIdNamePair;
import edu.pw.chat.entitities.ChatThread;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChatThreadRepository extends CrudRepository<ChatThread, Long> {

    @Query("select new edu.pw.chat.dtos.ChatMemberIdNamePair(si.owner.id, si.owner.visibleName) " +
            "from ChatThread t " +
            "join t.subscribedInboxes si " +
            "where t.id = :threadId")
    List<ChatMemberIdNamePair> findAllMemberIdNamePairsByThreadId(@Param("threadId") Long threadId);

    @Query("SELECT COUNT(t) > 0 " +
            "FROM ChatThread t " +
            "JOIN t.subscribedInboxes si " +
            "WHERE t.id = :threadId AND si.owner.username = :username")
    boolean isUserAMemberOfThread(@Param("threadId") Long threadId,
                                  @Param("username") String username);

    @Query("SELECT (si.owner.visibleName) " +
            "FROM ChatThread t " +
            "JOIN t.subscribedInboxes si " +
            "WHERE t.id = :threadId " +
            "AND si.owner.username <> :loggedUsername")
    Optional<String> getNonGroupConversationName(@Param("threadId") Long threadId,
                                                 @Param("loggedUsername") String loggedUsername);
}
