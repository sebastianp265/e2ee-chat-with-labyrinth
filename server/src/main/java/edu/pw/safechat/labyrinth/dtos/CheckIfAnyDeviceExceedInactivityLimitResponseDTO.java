package edu.pw.safechat.labyrinth.dtos;

public record CheckIfAnyDeviceExceedInactivityLimitResponseDTO(
        boolean didAnyDeviceExceedInactivityLimit
) {
}
