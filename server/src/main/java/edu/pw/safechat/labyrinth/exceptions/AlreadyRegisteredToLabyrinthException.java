package edu.pw.safechat.labyrinth.exceptions;

import edu.pw.safechat.common.exceptions.APIException;
import org.springframework.http.HttpStatus;

public class AlreadyRegisteredToLabyrinthException extends APIException {

    public AlreadyRegisteredToLabyrinthException() {
        super(HttpStatus.BAD_REQUEST, "ALREADY_REGISTERED_TO_LABYRINTH");
    }

}
