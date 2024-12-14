package edu.pw.safechat.chat.payloads.received;

import com.fasterxml.jackson.databind.JsonNode;

public record GenericMessageReceived(
        String type,
        JsonNode payload
) {
}
