package edu.pw.safechat.labyrinth.exceptions;

import edu.pw.safechat.common.exceptions.APIException;
import org.springframework.http.HttpStatus;

public class VirtualDeviceAccessDeniedException extends APIException {
    public VirtualDeviceAccessDeniedException() {
        super(HttpStatus.FORBIDDEN, "VIRTUAL_DEVICE_ACCESS_DENIED");
    }
}
