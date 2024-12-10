package edu.pw.safechat.chat.payloads.received;

import java.util.UUID;

public record NewChatMessageReceivedPayload(
        UUID threadId,
        String content
) {
}
