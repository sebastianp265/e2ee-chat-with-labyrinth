package edu.pw.safechat.labyrinth.controllers;

import edu.pw.safechat.chat.services.ChatInboxService;
import edu.pw.safechat.labyrinth.dtos.AuthenticateDeviceToEpochDTO;
import edu.pw.safechat.labyrinth.internal.services.AuthenticateDeviceToEpochService;
import edu.pw.safechat.user.internal.services.ChatUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/labyrinth-service/epochs")
public class AuthenticateDeviceToEpochController {

    private final ChatUserService chatUserService;
    private final ChatInboxService chatInboxService;
    private final AuthenticateDeviceToEpochService authenticateDeviceToEpochService;

    @PostMapping("/{epochId}/devices/{deviceId}/authenticate")
    public ResponseEntity<Void> authenticateDeviceToEpochAndRegisterDevice(
            @PathVariable UUID epochId,
            @PathVariable UUID deviceId,
            @RequestBody AuthenticateDeviceToEpochDTO requestBodyDTO,
            Authentication authentication
    ) {
        UUID userId = chatUserService.getUserIdByAuthentication(authentication);
        UUID inboxId = chatInboxService.getChatInboxByUserId(userId);

        authenticateDeviceToEpochService.authenticateDeviceToEpoch(
                epochId,
                deviceId,
                requestBodyDTO,
                inboxId
        );
        return ResponseEntity.ok().build();
    }
}
