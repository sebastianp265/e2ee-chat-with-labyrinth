package edu.pw.safechat.chat.payloads.tosend;

import java.util.UUID;

public record WebSocketChatMessage(
        UUID id,
        UUID authorId,
        String content,
        long timestamp
) {

}