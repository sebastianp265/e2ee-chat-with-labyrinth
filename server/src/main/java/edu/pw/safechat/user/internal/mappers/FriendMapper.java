package edu.pw.safechat.user.internal.mappers;

import edu.pw.safechat.user.dtos.FriendDTO;
import edu.pw.safechat.user.internal.entities.ChatUser;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper
public interface FriendMapper {

    @Mapping(target = "userId", source = "chatUser.id")
    @Mapping(target = "visibleName", source = "visibleName")
    FriendDTO toDTO(ChatUser chatUser);
}
