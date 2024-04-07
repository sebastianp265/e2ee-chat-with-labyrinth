package edu.pw.chat.dtos;

import lombok.Builder;
import lombok.Data;
import lombok.extern.jackson.Jacksonized;

@Jacksonized
@Data
@Builder
public class ThreadPreviewGetDTO {

    Long threadId;

    String threadName;

    String lastMessage;

    String lastMessageAuthorName;
}
