package edu.pw.safechat.labyrinth.controllers;

import edu.pw.safechat.chat.services.ChatInboxService;
import edu.pw.safechat.labyrinth.dtos.GetDevicesInEpochResponseDTO;
import edu.pw.safechat.labyrinth.dtos.OpenNewEpochBasedOnCurrentBodyDTO;
import edu.pw.safechat.labyrinth.dtos.OpenNewEpochBasedOnCurrentResponseDTO;
import edu.pw.safechat.labyrinth.internal.services.GetDevicesService;
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

    private final GetDevicesService getDevicesService;
    private final ChatUserService chatUserService;
    private final ChatInboxService chatInboxService;

    @GetMapping("/{epochId}/devices")
    public ResponseEntity<GetDevicesInEpochResponseDTO> getDevicesInEpoch(
            @PathVariable UUID epochId,
            Authentication authentication
    ) {
        UUID userId = chatUserService.getUserIdByAuthentication(authentication);
        UUID inboxId = chatInboxService.getChatInboxByUserId(userId);

        return ResponseEntity.ok(
                getDevicesService.getDevicesInEpoch(
                        epochId,
                        inboxId
                )
        );
    }

    @PostMapping("/open-based-on-current/{currentEpochId}")
    public ResponseEntity<OpenNewEpochBasedOnCurrentResponseDTO> openNewEpochBasedOnCurrent(
            @PathVariable UUID currentEpochId,
            @RequestBody OpenNewEpochBasedOnCurrentBodyDTO openNewEpochBasedOnCurrentBodyDTO,
            Authentication authentication
    ) {
        throw new UnsupportedOperationException("Not implemented yet");
    }
}
