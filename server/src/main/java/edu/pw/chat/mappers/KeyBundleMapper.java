package edu.pw.chat.mappers;

import edu.pw.chat.dtos.labyrinth.KeyBundleDTO;
import edu.pw.chat.entitities.ChatUser;
import edu.pw.chat.entitities.labyrinth.KeyBundle;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.springframework.stereotype.Component;

@Component
@Mapper
public interface KeyBundleMapper {

    @Mapping(target = "id", ignore = true)
    KeyBundle toKeyBundle(KeyBundleDTO keyBundleDTO, ChatUser chatUser);
}
