package edu.pw.chat.exceptions;

import lombok.Value;

import java.io.Serial;
import java.io.Serializable;
import java.util.EnumMap;
import java.util.Map;

@Value
public class APIErrorDetails implements Serializable {
    @Serial
    private static final long serialVersionUID = 1L;

    String errorCode;
    EnumMap<ErrorKey, Serializable> errorDetails;

    public APIErrorDetails(
            String errorCode,
            Map<ErrorKey, Serializable> errorDetails
    ) {
        this.errorCode = errorCode;
        if (errorDetails != null) {
            this.errorDetails = new EnumMap<>(errorDetails);
        } else {
            this.errorDetails = null;
        }
    }

    public enum ErrorKey {
        GOT("got");

        private final String key;

        ErrorKey(final String key) {
            this.key = key;
        }

        @Override
        public String toString() {
            return key;
        }
    }

    public APIErrorDetails(String errorCode) {
        this(errorCode, null);
    }

}
