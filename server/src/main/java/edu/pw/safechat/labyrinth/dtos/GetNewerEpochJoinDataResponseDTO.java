package edu.pw.safechat.labyrinth.dtos;

import edu.pw.safechat.labyrinth.dtos.common.DevicePublicKeyBundleDTO;

import java.util.UUID;

public record GetNewerEpochJoinDataResponseDTO(
        UUID epochId,
        byte[] encryptedEpochEntropy,
        DevicePublicKeyBundleDTO senderDevicePublicKeyBundle
) {
}
