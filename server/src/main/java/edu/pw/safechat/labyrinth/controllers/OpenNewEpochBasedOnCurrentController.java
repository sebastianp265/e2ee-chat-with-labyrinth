package edu.pw.safechat.labyrinth.controllers;

import edu.pw.safechat.chat.services.ChatInboxService;
import edu.pw.safechat.labyrinth.dtos.AllDevicesDTO;
import edu.pw.safechat.labyrinth.dtos.OpenNewEpochBasedOnCurrentBodyDTO;
import edu.pw.safechat.labyrinth.dtos.OpenNewEpochBasedOnCurrentResponseDTO;
import edu.pw.safechat.labyrinth.internal.services.OpenNewEpochBasedOnCurrentService;
import edu.pw.safechat.user.internal.services.ChatUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/labyrinth-service/epochs")
@RequiredArgsConstructor
public class OpenNewEpochBasedOnCurrentController {

    private final OpenNewEpochBasedOnCurrentService openNewEpochBasedOnCurrentService;
    private final ChatUserService chatUserService;
    private final ChatInboxService chatInboxService;

    @GetMapping("/{epochId}/devices")
    public ResponseEntity<AllDevicesDTO> getDevicesInEpoch(
            @PathVariable UUID epochId,
            Authentication authentication
    ) {
        UUID userId = chatUserService.getUserIdByAuthentication(authentication);
        UUID inboxId = chatInboxService.getChatInboxByUserId(userId);

        return ResponseEntity.ok(
                openNewEpochBasedOnCurrentService.getDevicesInEpoch(
                        epochId,
                        inboxId
                )
        );
    }

    @PostMapping("/open-based-on-current/{currentEpochId}/by-device/{deviceId}")
    public ResponseEntity<OpenNewEpochBasedOnCurrentResponseDTO> openNewEpochBasedOnCurrent(
            @PathVariable UUID currentEpochId,
            @PathVariable UUID deviceId,
            @RequestBody OpenNewEpochBasedOnCurrentBodyDTO openNewEpochBasedOnCurrentBodyDTO,
            Authentication authentication
    ) {
        UUID userId = chatUserService.getUserIdByAuthentication(authentication);
        UUID inboxId = chatInboxService.getChatInboxByUserId(userId);

        return ResponseEntity.ok(
                openNewEpochBasedOnCurrentService.openNewEpochBasedOnCurrent(
                        currentEpochId,
                        deviceId,
                        openNewEpochBasedOnCurrentBodyDTO,
                        inboxId
                )
        );
    }
}
