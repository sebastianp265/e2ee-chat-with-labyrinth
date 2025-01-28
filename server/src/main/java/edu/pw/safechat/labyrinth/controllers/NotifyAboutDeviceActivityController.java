package edu.pw.safechat.labyrinth.controllers;

import edu.pw.safechat.chat.services.ChatInboxService;
import edu.pw.safechat.labyrinth.internal.entities.Labyrinth;
import edu.pw.safechat.labyrinth.internal.services.common.DeviceService;
import edu.pw.safechat.labyrinth.internal.services.common.LabyrinthService;
import edu.pw.safechat.user.internal.services.ChatUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/labyrinth-service")
@RequiredArgsConstructor
public class NotifyAboutDeviceActivityController {

    private final DeviceService deviceService;
    private final ChatUserService chatUserService;
    private final ChatInboxService chatInboxService;
    private final LabyrinthService labyrinthService;

    @PostMapping("/devices/{deviceId}/notify-activity")
    public ResponseEntity<Void> notifyAboutDeviceActivity(
            @PathVariable UUID deviceId,
            Authentication authentication
    ) {
        UUID userId = chatUserService.getUserIdByAuthentication(authentication);
        UUID inboxId = chatInboxService.getChatInboxByUserId(userId);

        Labyrinth labyrinth = labyrinthService.getByChatInboxId(inboxId);

        deviceService.updateLastActiveAt(
                labyrinth,
                deviceId
        );
        return ResponseEntity.ok().build();
    }
}
