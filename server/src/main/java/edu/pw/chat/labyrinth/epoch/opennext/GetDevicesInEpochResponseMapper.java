package edu.pw.chat.labyrinth.epoch.opennext;

import edu.pw.chat.labyrinth.common.entities.DeviceEpochMembershipProof;
import edu.pw.chat.labyrinth.common.entities.VirtualDeviceEpochMembershipProof;
import edu.pw.chat.labyrinth.epoch.opennext.GetDevicesInEpochResponseDTO.DeviceInEpoch;
import edu.pw.chat.labyrinth.epoch.opennext.GetDevicesInEpochResponseDTO.VirtualDeviceInEpoch;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper
public interface GetDevicesInEpochResponseMapper {

    @Mapping(target = "devices", source = "deviceEpochMembershipProofs")
    @Mapping(target = "virtualDevice", source = "virtualDeviceEpochMembershipProof")
    GetDevicesInEpochResponseDTO toDTO(
            List<DeviceEpochMembershipProof> deviceEpochMembershipProofs,
            VirtualDeviceEpochMembershipProof virtualDeviceEpochMembershipProof
    );

    @Mapping(target = "id", source = "device.id")
    @Mapping(target = "mac", source = "epochDeviceMac")
    @Mapping(target = "keyBundle", source = "device")
    DeviceInEpoch toDeviceInEpoch(
            DeviceEpochMembershipProof deviceEpochMembershipProof
    );

    @Mapping(target = "mac", source = "epochDeviceMac")
    @Mapping(target = "keyBundle", source = "virtualDevice")
    VirtualDeviceInEpoch toVirtualDeviceInEpoch(
            VirtualDeviceEpochMembershipProof virtualDeviceEpochMembershipProof
    );

}
