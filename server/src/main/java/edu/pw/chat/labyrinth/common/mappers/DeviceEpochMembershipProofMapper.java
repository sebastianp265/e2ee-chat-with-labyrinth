package edu.pw.chat.labyrinth.common.mappers;

import edu.pw.chat.labyrinth.common.entities.Device;
import edu.pw.chat.labyrinth.common.entities.DeviceEpochMembershipProof;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper
public interface DeviceEpochMembershipProofMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "device", source = "device")
    @Mapping(target = "epochDeviceMac", source = "epochDeviceMac")
    DeviceEpochMembershipProof toEntity(
            Device device,
            byte[] epochDeviceMac
    );
}
