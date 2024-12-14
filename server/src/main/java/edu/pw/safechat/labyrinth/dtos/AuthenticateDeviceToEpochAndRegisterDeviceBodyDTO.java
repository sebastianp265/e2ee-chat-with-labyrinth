package edu.pw.safechat.labyrinth.dtos;

import edu.pw.safechat.labyrinth.dtos.common.DevicePublicKeyBundleDTO;

public record AuthenticateDeviceToEpochAndRegisterDeviceBodyDTO(
        DevicePublicKeyBundleDTO devicePublicKeyBundle,
        byte[] epochDeviceMac
) {
}
