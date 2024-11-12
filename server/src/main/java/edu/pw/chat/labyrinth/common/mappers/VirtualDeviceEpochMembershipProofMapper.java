package edu.pw.chat.labyrinth.common.mappers;

import edu.pw.chat.labyrinth.common.entities.Epoch;
import edu.pw.chat.labyrinth.common.entities.VirtualDevice;
import edu.pw.chat.labyrinth.common.entities.VirtualDeviceEpochMembershipProof;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper
public interface VirtualDeviceEpochMembershipProofMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "epoch", source = "epoch")
    @Mapping(target = "virtualDevice", source = "virtualDevice")
    @Mapping(target = "epochDeviceMac", source = "epochDeviceMac")
    VirtualDeviceEpochMembershipProof toEntity(
            Epoch epoch,
            VirtualDevice virtualDevice,
            byte[] epochDeviceMac
    );

}
