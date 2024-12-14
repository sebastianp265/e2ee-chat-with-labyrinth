package edu.pw.safechat.labyrinth.dtos;

import java.util.UUID;

public record AuthenticateDeviceToEpochAndRegisterDeviceResponseDTO(
        UUID assignedDeviceId
) {
}
