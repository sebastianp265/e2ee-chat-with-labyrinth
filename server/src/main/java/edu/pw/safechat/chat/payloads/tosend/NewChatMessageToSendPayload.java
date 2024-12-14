package edu.pw.safechat.chat.payloads.tosend;

import java.util.UUID;

public record NewChatMessageToSendPayload(
        UUID threadId,
        WebSocketChatMessage message
) {

}
