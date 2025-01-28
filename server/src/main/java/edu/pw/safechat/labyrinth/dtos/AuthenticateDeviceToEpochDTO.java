package edu.pw.safechat.labyrinth.dtos;

public record AuthenticateDeviceToEpochDTO(
        byte[] epochDeviceMac
) {
}
