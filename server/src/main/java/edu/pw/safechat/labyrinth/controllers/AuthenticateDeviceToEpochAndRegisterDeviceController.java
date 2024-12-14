package edu.pw.safechat.labyrinth.controllers;

import edu.pw.safechat.chat.services.ChatInboxService;
import edu.pw.safechat.labyrinth.dtos.AuthenticateDeviceToEpochAndRegisterDeviceBodyDTO;
import edu.pw.safechat.labyrinth.dtos.AuthenticateDeviceToEpochAndRegisterDeviceResponseDTO;
import edu.pw.safechat.labyrinth.internal.services.AuthenticateDeviceToEpochAndRegisterDeviceService;
import edu.pw.safechat.user.internal.services.ChatUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/labyrinth-service/epochs")
@RequiredArgsConstructor
public class AuthenticateDeviceToEpochAndRegisterDeviceController {

    private final AuthenticateDeviceToEpochAndRegisterDeviceService authenticateDeviceToEpochAndRegisterDeviceService;
    private final ChatUserService chatUserService;
    private final ChatInboxService chatInboxService;

    @PostMapping("/{epochId}/authenticate-and-register-device")
    public ResponseEntity<AuthenticateDeviceToEpochAndRegisterDeviceResponseDTO> authenticateDeviceToEpochAndRegisterDevice(
            @PathVariable UUID epochId,
            @RequestBody AuthenticateDeviceToEpochAndRegisterDeviceBodyDTO requestBodyDTO,
            Authentication authentication
    ) {
        UUID userId = chatUserService.getUserIdByAuthentication(authentication);
        UUID inboxId = chatInboxService.getChatInboxByUserId(userId);

        return ResponseEntity.ok(
                authenticateDeviceToEpochAndRegisterDeviceService.authenticateDeviceToEpochAndRegisterDevice(
                        epochId,
                        requestBodyDTO,
                        inboxId
                )
        );
    }
}
