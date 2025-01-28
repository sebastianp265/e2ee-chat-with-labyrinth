package edu.pw.safechat.labyrinth.controllers;

import edu.pw.safechat.chat.services.ChatInboxService;
import edu.pw.safechat.labyrinth.dtos.CheckIfAnyDeviceExceedInactivityLimitResponseDTO;
import edu.pw.safechat.labyrinth.internal.entities.Labyrinth;
import edu.pw.safechat.labyrinth.internal.services.common.DeviceService;
import edu.pw.safechat.labyrinth.internal.services.common.LabyrinthService;
import edu.pw.safechat.user.internal.services.ChatUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/labyrinth-service")
@RequiredArgsConstructor
public class CheckIfAnyDeviceExceedInactivityLimitController {

    private final DeviceService deviceService;
    private final LabyrinthService labyrinthService;
    private final ChatInboxService chatInboxService;
    private final ChatUserService chatUserService;

    @GetMapping("/did-any-device-exceed-inactivity-limit")
    public ResponseEntity<CheckIfAnyDeviceExceedInactivityLimitResponseDTO> checkIfDeviceExceedInactivityLimit(
            Authentication authentication
    ) {
        UUID userId = chatUserService.getUserIdByAuthentication(authentication);
        UUID inboxId = chatInboxService.getChatInboxByUserId(userId);
        Labyrinth labyrinth = labyrinthService.getByChatInboxId(inboxId);

        return ResponseEntity.ok(
                new CheckIfAnyDeviceExceedInactivityLimitResponseDTO(
                        deviceService.didAnyDeviceExceedInactivityLimit(labyrinth)
                )
        );
    }

}
