package edu.pw.chat.repository.user;

import edu.pw.chat.entitities.user.ChatUser;
import org.springframework.data.repository.CrudRepository;

import java.util.Optional;

public interface ChatUserRepository extends CrudRepository<ChatUser, Long> {

    Optional<ChatUser> findByUsername(String username);

}
