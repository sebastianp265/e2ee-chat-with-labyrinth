package edu.pw.chat.repository.user;

import edu.pw.chat.entitities.user.FriendRelation;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FriendRelationRepository extends CrudRepository<FriendRelation, Long> {

}
