package edu.pw.chat.dtos;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class ChatUserGetDTO {

    Long userId;
    String visibleName;
}
