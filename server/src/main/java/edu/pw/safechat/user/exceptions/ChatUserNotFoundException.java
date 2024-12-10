package edu.pw.safechat.user.exceptions;

import edu.pw.safechat.common.exceptions.APIException;
import org.springframework.http.HttpStatus;

public class ChatUserNotFoundException extends APIException {

    public ChatUserNotFoundException() {
        super(
                HttpStatus.NOT_FOUND,
                "USER_NOT_FOUND"
        );
    }

}
