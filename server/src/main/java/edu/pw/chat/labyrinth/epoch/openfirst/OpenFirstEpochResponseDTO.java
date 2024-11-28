package edu.pw.chat.labyrinth.epoch.openfirst;

import java.util.UUID;

public record OpenFirstEpochResponseDTO(
        UUID inboxID,
        UUID deviceID,
        UUID epochID
) {
}
