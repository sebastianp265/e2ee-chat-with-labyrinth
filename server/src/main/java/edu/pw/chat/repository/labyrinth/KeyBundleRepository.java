package edu.pw.chat.repository.labyrinth;

import edu.pw.chat.entitities.labyrinth.KeyBundle;
import org.springframework.data.repository.CrudRepository;

public interface KeyBundleRepository extends CrudRepository<KeyBundle, Long> {

    boolean existsByIdAndChatUser_Username(Long id, String username);
}
