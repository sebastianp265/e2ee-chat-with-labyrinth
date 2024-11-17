package edu.pw.chat.labyrinth.common.mappers;

import edu.pw.chat.labyrinth.common.dtos.VirtualDevicePublicKeyBundleDTO;
import edu.pw.chat.labyrinth.common.entities.ChatInbox;
import edu.pw.chat.labyrinth.common.entities.VirtualDevice;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper
public interface VirtualDeviceMapper {

    @Mapping(target = "id", source = "id")
    @Mapping(target = "chatInbox", source = "chatInbox")
    VirtualDevice toEntity(
            String id,
            ChatInbox chatInbox,
            VirtualDevicePublicKeyBundleDTO virtualDevicePublicKeyBundleDTO
    );
}
