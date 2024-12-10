package edu.pw.safechat.chat.payloads.tosend;

public record GenericMessageToSend(
        String type,
        Object payload
) {

}
