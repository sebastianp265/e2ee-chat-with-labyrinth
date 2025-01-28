package edu.pw.safechat.labyrinth.internal.mappers;

import edu.pw.safechat.labyrinth.dtos.common.DevicePublicKeyBundleDTO;
import edu.pw.safechat.labyrinth.internal.entities.Device;
import edu.pw.safechat.labyrinth.internal.entities.Labyrinth;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper
public interface DeviceMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "labyrinth", source = "labyrinth")
    @Mapping(target = "lastActiveAt", expression = "java(java.time.Instant.now())")
    Device toEntity(
            DevicePublicKeyBundleDTO devicePublicKeyBundleDTO,
            Labyrinth labyrinth
    );

    DevicePublicKeyBundleDTO toDevicePublicKeyBundleDTO(Device device);
}
