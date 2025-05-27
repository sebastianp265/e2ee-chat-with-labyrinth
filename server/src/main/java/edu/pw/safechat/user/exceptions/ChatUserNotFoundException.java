package edu.pw.safechat.user.exceptions;

import edu.pw.safechat.common.exceptions.APIException;
import edu.pw.safechat.common.exceptions.APIErrorDetails.ErrorKey;

import java.util.Map;

import org.springframework.http.HttpStatus;

public class ChatUserNotFoundException extends APIException {

    public ChatUserNotFoundException() {
        super(
                HttpStatus.NOT_FOUND,
                "USER_NOT_FOUND"
        );
    }

    public ChatUserNotFoundException(String username) {
        super(
                HttpStatus.NOT_FOUND,
                "USER_NOT_FOUND",
                Map.of(ErrorKey.GOT, username)
        );
    }

}
