package edu.pw.chat.repository;

import edu.pw.chat.entitities.Friend;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FriendRepository extends CrudRepository<Friend, Long> {

    List<Friend> findAllByUser_Username(String username);
}
