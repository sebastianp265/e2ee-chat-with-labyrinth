package edu.pw.chat.repository;

import edu.pw.chat.entitities.ChatUser;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserInfoRepository extends CrudRepository<ChatUser, Long> {
}
