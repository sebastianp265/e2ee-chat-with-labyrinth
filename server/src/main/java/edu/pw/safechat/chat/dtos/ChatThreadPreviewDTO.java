package edu.pw.safechat.chat.dtos;

import edu.pw.safechat.labyrinth.dtos.chat.ChatMessageGetDTO;

import java.util.Map;
import java.util.UUID;


public record ChatThreadPreviewDTO(
        UUID threadId,
        String threadName,
        ChatMessageGetDTO message,
        Map<UUID, String> membersVisibleNameByUserId
) {

}
