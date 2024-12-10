package edu.pw.safechat.labyrinth.dtos;

import edu.pw.safechat.labyrinth.dtos.common.DevicePublicKeyBundleWithoutEpochStorageAuthKeyPairDTO;

import java.util.List;
import java.util.UUID;

public record GetDevicesInEpochResponseDTO(
        List<DeviceInEpoch> devices,
        VirtualDeviceInEpoch virtualDevice
) {

    public record DeviceInEpoch(
            UUID id,
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
