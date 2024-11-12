package edu.pw.chat.labyrinth.epoch.openfirst.dtos;

import java.util.UUID;

public record OpenFirstEpochResponseDTO(
        UUID deviceID,
        UUID epochID
) {
}
