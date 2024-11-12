package edu.pw.chat.user.exceptions;


import edu.pw.chat.exceptions.APIErrorDetails;
import edu.pw.chat.exceptions.APIException;
import org.springframework.http.HttpStatus;

import java.util.Map;

public class ChatUserNotFoundException extends APIException {

    public ChatUserNotFoundException(String username) {
        super(
                HttpStatus.NOT_FOUND,
                "USER_NOT_FOUND",
                Map.of(APIErrorDetails.ErrorKey.GOT, username)
        );
    }

}
