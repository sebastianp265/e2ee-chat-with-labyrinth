package edu.pw.safechat.labyrinth.controllers;

import edu.pw.safechat.chat.services.ChatInboxService;
import edu.pw.safechat.labyrinth.dtos.OpenFirstEpochBodyDTO;
import edu.pw.safechat.labyrinth.dtos.OpenFirstEpochResponseDTO;
import edu.pw.safechat.labyrinth.internal.services.OpenFirstEpochService;
import edu.pw.safechat.user.internal.services.ChatUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/labyrinth/epochs")
@RequiredArgsConstructor
public class OpenFirstEpochController {

    private final OpenFirstEpochService openFirstEpochService;
    private final ChatUserService chatUserService;
    private final ChatInboxService chatInboxService;

    @PostMapping("/open-first")
    public ResponseEntity<OpenFirstEpochResponseDTO> openFirstEpoch(
            @RequestBody OpenFirstEpochBodyDTO openFirstEpochBodyDTO,
            Authentication authentication
    ) {
        UUID userId = chatUserService.getUserIdByAuthentication(authentication);
        UUID inboxId = chatInboxService.getChatInboxByUserId(userId);
        OpenFirstEpochResponseDTO openFirstEpochResponseDTO = openFirstEpochService.openFirstEpoch(
                openFirstEpochBodyDTO,
                inboxId
        );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(openFirstEpochResponseDTO);
    }

}
