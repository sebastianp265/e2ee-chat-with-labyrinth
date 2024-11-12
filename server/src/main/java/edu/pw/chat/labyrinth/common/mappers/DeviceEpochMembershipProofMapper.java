package edu.pw.chat.labyrinth.common.mappers;

import edu.pw.chat.labyrinth.common.entities.Device;
import edu.pw.chat.labyrinth.common.entities.DeviceEpochMembershipProof;
import edu.pw.chat.labyrinth.common.entities.Epoch;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper
public interface DeviceEpochMembershipProofMapper {

    @Mapping(target = "id", ignore = true)
    DeviceEpochMembershipProof toEntity(
            Epoch epoch,
            Device device,
            byte[] epochDeviceMac
    );
}
