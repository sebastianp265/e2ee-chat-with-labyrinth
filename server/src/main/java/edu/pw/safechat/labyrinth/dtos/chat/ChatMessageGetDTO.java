package edu.pw.safechat.labyrinth.dtos.chat;

import java.util.UUID;

public record ChatMessageGetDTO(
        UUID id,
        String epochSequenceId,
        byte[] encryptedMessageData,
        long timestamp
) {
}
