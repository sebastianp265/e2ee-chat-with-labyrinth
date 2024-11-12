package edu.pw.chat.exceptions;

import edu.pw.chat.exceptions.APIErrorDetails.ErrorKey;
import lombok.Getter;
import org.springframework.http.HttpStatus;

import java.io.Serializable;
import java.util.Map;

@Getter
public class APIException extends RuntimeException {
    private final APIErrorDetails errorDetails;
    private final HttpStatus httpStatus;

    public APIException(HttpStatus httpStatus, String errorCode, Map<ErrorKey, Serializable> errors) {
        this.httpStatus = httpStatus;
        this.errorDetails = new APIErrorDetails(errorCode, errors);
    }

    public APIException(HttpStatus httpStatus, String errorCode) {
        this.httpStatus = httpStatus;
        this.errorDetails = new APIErrorDetails(errorCode);
    }

}
