package edu.pw.safechat.user.internal.repositories;

import edu.pw.safechat.user.internal.entities.FriendRelation;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface FriendRelationRepository extends CrudRepository<FriendRelation, Long> {

    List<FriendRelation> findAllByChatUser_Id(UUID chatUserId);

}
