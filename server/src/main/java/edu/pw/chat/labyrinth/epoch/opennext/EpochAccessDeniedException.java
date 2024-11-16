package edu.pw.chat.labyrinth.epoch.opennext;

import edu.pw.chat.exceptions.APIException;
import org.springframework.http.HttpStatus;

public class EpochAccessDeniedException extends APIException {
    public EpochAccessDeniedException() {
        super(HttpStatus.FORBIDDEN, "EPOCH_ACCESS_DENIED");
    }
}
