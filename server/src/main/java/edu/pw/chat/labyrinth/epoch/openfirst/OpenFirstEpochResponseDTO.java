package edu.pw.chat.labyrinth.epoch.openfirst;

import java.util.UUID;

public record OpenFirstEpochResponseDTO(
        UUID deviceID,
        UUID epochID
) {
}
