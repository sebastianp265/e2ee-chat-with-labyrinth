package edu.pw.safechat.user.internal.repositories;

import edu.pw.safechat.user.internal.entities.ChatUser;
import org.springframework.data.repository.CrudRepository;

import java.util.Optional;
import java.util.Set;
import java.util.UUID;

public interface ChatUserRepository extends CrudRepository<ChatUser, UUID> {

    Optional<ChatUser> findByUsername(String username);

    Integer countAllByIdIn(Set<UUID> ids);

    default boolean existsAllById(Set<UUID> ids) {
        return countAllByIdIn(ids).equals(ids.size());
    }

}
