package edu.pw.chat.labyrinth.common.mappers;

import edu.pw.chat.labyrinth.common.entities.VirtualDevice;
import edu.pw.chat.labyrinth.common.entities.VirtualDeviceEpochMembershipProof;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper
public interface VirtualDeviceEpochMembershipProofMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "virtualDevice", source = "virtualDevice")
    @Mapping(target = "epochDeviceMac", source = "epochDeviceMac")
    VirtualDeviceEpochMembershipProof toEntity(
            VirtualDevice virtualDevice,
            byte[] epochDeviceMac
    );

}
