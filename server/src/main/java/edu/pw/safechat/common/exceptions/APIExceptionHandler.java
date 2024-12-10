package edu.pw.safechat.common.exceptions;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class APIExceptionHandler {

    @ExceptionHandler(APIException.class)
    public ResponseEntity<APIErrorDetails> handleAPIException(APIException e) {
        return ResponseEntity
                .status(e.getHttpStatus())
                .body(e.getErrorDetails());
    }
}
