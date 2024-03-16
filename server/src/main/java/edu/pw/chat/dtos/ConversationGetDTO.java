package edu.pw.chat.dtos;

import lombok.Builder;
import lombok.Value;
import lombok.extern.jackson.Jacksonized;

import java.util.List;
import java.util.Map;

@Value
@Builder
@Jacksonized
public class ConversationGetDTO {

    List<MessageGetDTO> messages;
    Map<Long, String> userIdToName;
}
