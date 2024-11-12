package edu.pw.chat.labyrinth.epoch.openfirst;

import edu.pw.chat.exceptions.APIException;
import org.springframework.http.HttpStatus;

public class AlreadyRegisteredToLabyrinthException extends APIException {

    public AlreadyRegisteredToLabyrinthException() {
        super(HttpStatus.BAD_REQUEST, "ALREADY_REGISTERED_TO_LABYRINTH");
    }

}
