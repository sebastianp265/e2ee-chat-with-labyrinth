package edu.pw.chat.labyrinth.common.mappers;

import edu.pw.chat.labyrinth.common.dtos.DevicePublicKeyBundleDTO;
import edu.pw.chat.labyrinth.common.entities.Device;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper
public interface DeviceMapper {

    @Mapping(target = "id", ignore = true)
    Device toEntity(
            DevicePublicKeyBundleDTO devicePublicKeyBundleDTO
    );
}
