package edu.pw.chat.users.repositories;

import edu.pw.chat.users.entities.FriendRelation;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FriendRelationRepository extends CrudRepository<FriendRelation, Long> {

}
