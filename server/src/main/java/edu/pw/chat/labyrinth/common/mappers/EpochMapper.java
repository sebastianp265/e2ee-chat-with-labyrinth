package edu.pw.chat.labyrinth.common.mappers;

import edu.pw.chat.labyrinth.common.entities.ChatInbox;
import edu.pw.chat.labyrinth.common.entities.DeviceEpochMembershipProof;
import edu.pw.chat.labyrinth.common.entities.Epoch;
import edu.pw.chat.labyrinth.common.entities.VirtualDeviceEpochMembershipProof;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper
public interface EpochMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "chatInbox", source = "chatInbox")
    @Mapping(target = "deviceEpochMembershipProofs", source = "deviceEpochMembershipProofs")
    @Mapping(target = "virtualDeviceEpochMembershipProof", source = "virtualDeviceEpochMembershipProof")
    @Mapping(target = "sequenceID", source = "sequenceID")
    Epoch toEntity(
            ChatInbox chatInbox,
            List<DeviceEpochMembershipProof> deviceEpochMembershipProofs,
            VirtualDeviceEpochMembershipProof virtualDeviceEpochMembershipProof,
            String sequenceID
    );

}
