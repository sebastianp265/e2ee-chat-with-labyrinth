package edu.pw.chat.dtos;

import lombok.Builder;
import lombok.Data;
import lombok.extern.jackson.Jacksonized;

@Jacksonized
@Data
@Builder
public class ConversationPreviewGetDTO {

    Long conversationId;

    String conversationName;

    String lastMessage;

    String lastMessageAuthorName;
}
