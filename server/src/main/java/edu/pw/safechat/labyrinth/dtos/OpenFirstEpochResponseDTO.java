package edu.pw.safechat.labyrinth.dtos;

import java.util.UUID;

public record OpenFirstEpochResponseDTO(
        UUID deviceId,
        UUID epochId
) {
}
