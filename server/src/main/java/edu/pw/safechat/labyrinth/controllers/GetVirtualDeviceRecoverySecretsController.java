package edu.pw.safechat.labyrinth.controllers;

import edu.pw.safechat.chat.services.ChatInboxService;
import edu.pw.safechat.labyrinth.dtos.GetVirtualDeviceRecoverySecretsBodyDTO;
import edu.pw.safechat.labyrinth.dtos.GetVirtualDeviceRecoverySecretsResponseDTO;
import edu.pw.safechat.labyrinth.internal.services.GetVirtualDeviceRecoverySecretsService;
import edu.pw.safechat.user.internal.services.ChatUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/labyrinth-service/virtual-device")
@RequiredArgsConstructor
public class GetVirtualDeviceRecoverySecretsController {

    private final GetVirtualDeviceRecoverySecretsService getVirtualDeviceRecoverySecretsService;
    private final ChatUserService chatUserService;
    private final ChatInboxService chatInboxService;

    @PostMapping("/recovery-secrets")
    public ResponseEntity<GetVirtualDeviceRecoverySecretsResponseDTO> getRecoverySecrets(
            @RequestBody GetVirtualDeviceRecoverySecretsBodyDTO getRecoverySecretsBodyDTO,
            Authentication authentication
    ) {
        UUID userId = chatUserService.getUserIdByAuthentication(authentication);
        UUID inboxId = chatInboxService.getChatInboxByUserId(userId);

        return ResponseEntity.ok(
                getVirtualDeviceRecoverySecretsService.getRecoverySecrets(
                        getRecoverySecretsBodyDTO.virtualDeviceId(),
                        inboxId
                )
        );
    }
}
