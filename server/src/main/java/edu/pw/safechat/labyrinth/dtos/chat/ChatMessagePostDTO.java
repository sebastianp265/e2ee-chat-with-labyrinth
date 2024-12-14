package edu.pw.safechat.labyrinth.dtos.chat;

import java.util.UUID;

public record ChatMessagePostDTO(
        UUID id,
        byte[] encryptedMessageData,
        long timestamp,
        UUID epochId
) {
}
