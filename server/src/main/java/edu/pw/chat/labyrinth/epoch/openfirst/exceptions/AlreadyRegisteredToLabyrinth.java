package edu.pw.chat.labyrinth.epoch.openfirst.exceptions;

import edu.pw.chat.exceptions.APIException;
import org.springframework.http.HttpStatus;

public class AlreadyRegisteredToLabyrinth extends APIException {

    public AlreadyRegisteredToLabyrinth() {
        super(HttpStatus.BAD_REQUEST, "ALREADY_REGISTERED_TO_LABYRINTH");
    }

}
