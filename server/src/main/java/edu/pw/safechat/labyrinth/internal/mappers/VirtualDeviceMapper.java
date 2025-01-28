package edu.pw.safechat.labyrinth.internal.mappers;

import edu.pw.safechat.labyrinth.dtos.common.VirtualDevicePublicKeyBundleDTO;
import edu.pw.safechat.labyrinth.internal.entities.Labyrinth;
import edu.pw.safechat.labyrinth.internal.entities.VirtualDevice;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper
public interface VirtualDeviceMapper {

    @Mapping(target = "id", source = "id")
    @Mapping(target = "labyrinth", source = "labyrinth")
    VirtualDevice toEntity(
            byte[] id,
            VirtualDevicePublicKeyBundleDTO virtualDevicePublicKeyBundleDTO,
            Labyrinth labyrinth
    );


}
