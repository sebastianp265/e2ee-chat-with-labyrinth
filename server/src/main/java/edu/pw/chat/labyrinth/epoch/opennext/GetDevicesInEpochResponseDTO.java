package edu.pw.chat.labyrinth.epoch.opennext;

import edu.pw.chat.labyrinth.common.dtos.DevicePublicKeyBundleWithoutEpochStorageAuthKeyPairDTO;

import java.util.List;

public record GetDevicesInEpochResponseDTO(
        List<DeviceInEpoch> devices,
        VirtualDeviceInEpoch virtualDevice
) {

    public record DeviceInEpoch(
            String id,
            byte[] mac,
            DevicePublicKeyBundleWithoutEpochStorageAuthKeyPairDTO keyBundle
    ) {

    }

    public record VirtualDeviceInEpoch(
            byte[] mac,
            DevicePublicKeyBundleWithoutEpochStorageAuthKeyPairDTO keyBundle
    ) {

    }

}
