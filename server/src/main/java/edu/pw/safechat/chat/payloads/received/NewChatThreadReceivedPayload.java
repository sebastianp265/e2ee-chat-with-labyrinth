package edu.pw.safechat.chat.payloads.received;

import java.util.List;
import java.util.UUID;

public record NewChatThreadReceivedPayload(
        String messageContent,
        List<UUID> memberUserIds
) {
}
