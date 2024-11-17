package edu.pw.chat.labyrinth.virtualdevice.getrecoverysecrets;

import edu.pw.chat.exceptions.APIException;
import org.springframework.http.HttpStatus;

public class VirtualDeviceAccessDeniedException extends APIException {
    public VirtualDeviceAccessDeniedException() {
        super(HttpStatus.FORBIDDEN, "VIRTUAL_DEVICE_ACCESS_DENIED");
    }
}
