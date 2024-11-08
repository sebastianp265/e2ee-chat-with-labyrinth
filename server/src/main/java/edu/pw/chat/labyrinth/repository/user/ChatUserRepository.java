package edu.pw.chat.labyrinth.repository.user;

import edu.pw.chat.users.entities.ChatUser;
import org.springframework.data.repository.CrudRepository;

import java.util.Optional;
import java.util.UUID;

public interface ChatUserRepository extends CrudRepository<ChatUser, UUID> {

    Optional<ChatUser> findByUsername(String username);

}
