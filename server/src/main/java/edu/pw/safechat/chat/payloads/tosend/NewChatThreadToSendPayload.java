package edu.pw.safechat.chat.payloads.tosend;

import java.util.Map;
import java.util.UUID;

public record NewChatThreadToSendPayload(
        UUID threadId,
        String threadName,
        WebSocketChatMessage initialMessage,
        Map<UUID, String> membersVisibleNameByUserId
) {
}
