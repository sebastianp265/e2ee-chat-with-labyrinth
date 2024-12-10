package edu.pw.safechat.labyrinth.exceptions;

import edu.pw.safechat.common.exceptions.APIException;
import org.springframework.http.HttpStatus;

public class EpochAccessDeniedException extends APIException {
    public EpochAccessDeniedException() {
        super(HttpStatus.FORBIDDEN, "EPOCH_ACCESS_DENIED");
    }
}
