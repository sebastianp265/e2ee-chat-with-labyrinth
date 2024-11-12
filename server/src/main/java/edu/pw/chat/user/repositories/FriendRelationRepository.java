package edu.pw.chat.user.repositories;

import edu.pw.chat.user.entities.FriendRelation;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FriendRelationRepository extends CrudRepository<FriendRelation, Long> {

}
