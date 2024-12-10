package edu.pw.safechat.chat.payloads.tosend;

import java.util.UUID;

public record ChatMessageToSendPayload(
        UUID id,
        UUID authorId,
        String content,
        long timestamp
) {

}