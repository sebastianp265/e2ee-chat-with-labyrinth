package edu.pw.safechat.chat.payloads.tosend;

import java.util.List;
import java.util.UUID;

public record NewMessagesToSendPayload(
        UUID threadId,
        List<ChatMessageToSendPayload> messages
) {

}
