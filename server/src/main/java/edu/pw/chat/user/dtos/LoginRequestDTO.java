package edu.pw.chat.user.dtos;

import lombok.Builder;
import lombok.Value;
import lombok.extern.jackson.Jacksonized;

@Value
@Builder
@Jacksonized
public class LoginRequestDTO {

    String username;

    String password;
}