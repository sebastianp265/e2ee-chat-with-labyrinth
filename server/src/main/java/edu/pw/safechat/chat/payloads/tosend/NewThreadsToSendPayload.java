package edu.pw.safechat.chat.payloads.tosend;

import java.util.List;
import java.util.Map;
import java.util.UUID;

public record NewThreadsToSendPayload(
        UUID threadId,
        String threadName,
        List<ChatMessageToSendPayload> messages,
        Map<UUID, String> membersVisibleNameByUserId
) {
}
