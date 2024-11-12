package edu.pw.chat.user.repositories;

import edu.pw.chat.user.entities.ChatUser;
import org.springframework.data.repository.CrudRepository;

import java.util.Optional;
import java.util.UUID;

public interface ChatUserRepository extends CrudRepository<ChatUser, UUID> {

    Optional<ChatUser> findByUsername(String username);

}
