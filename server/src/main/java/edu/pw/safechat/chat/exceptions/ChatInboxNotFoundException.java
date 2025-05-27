package edu.pw.safechat.chat.exceptions;

import edu.pw.safechat.common.exceptions.APIException;
import org.springframework.http.HttpStatus;

public class ChatInboxNotFoundException extends APIException {

    public ChatInboxNotFoundException() {
        super(
                HttpStatus.NOT_FOUND,
                "CHAT_INBOX_NOT_FOUND"
        );
    }
} 