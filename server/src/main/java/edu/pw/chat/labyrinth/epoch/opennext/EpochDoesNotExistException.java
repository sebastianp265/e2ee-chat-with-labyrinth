package edu.pw.chat.labyrinth.epoch.opennext;

import edu.pw.chat.exceptions.APIErrorDetails;
import edu.pw.chat.exceptions.APIException;
import org.springframework.http.HttpStatus;

import java.util.Map;
import java.util.UUID;

public class EpochDoesNotExistException extends APIException {

    public EpochDoesNotExistException(UUID epochID) {
        super(HttpStatus.NOT_FOUND, "EPOCH_DOES_NOT_EXIST", Map.of(APIErrorDetails.ErrorKey.GOT, epochID));
    }
}
