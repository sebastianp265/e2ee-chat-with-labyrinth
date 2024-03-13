package edu.pw.chat.dtos;

import lombok.Builder;
import lombok.Value;
import lombok.extern.jackson.Jacksonized;

@Value
@Builder
@Jacksonized
public class MessageGetDTO {

    String content;

    boolean isSender;
}
