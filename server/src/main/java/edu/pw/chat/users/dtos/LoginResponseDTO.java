package edu.pw.chat.users.dtos;

import lombok.Builder;
import lombok.Value;
import lombok.extern.jackson.Jacksonized;

import java.util.UUID;

@Value
@Builder
@Jacksonized
public class LoginResponseDTO {

    UUID userId;
    UUID inboxId;
}
