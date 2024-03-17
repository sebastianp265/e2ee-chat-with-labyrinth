package edu.pw.chat.repository;

import edu.pw.chat.entitities.ChatUser;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ChatUserRepository extends CrudRepository<ChatUser, Long> {

    Optional<ChatUser> findByName(String username);
}
