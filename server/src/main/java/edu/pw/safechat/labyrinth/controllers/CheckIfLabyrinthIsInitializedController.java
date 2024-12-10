package edu.pw.safechat.labyrinth.controllers;

import edu.pw.safechat.chat.services.ChatInboxService;
import edu.pw.safechat.labyrinth.dtos.CheckIfLabyrinthIsInitializedResponseDTO;
import edu.pw.safechat.labyrinth.internal.services.CheckIfLabyrinthIsInitializedService;
import edu.pw.safechat.user.internal.services.ChatUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/labyrinth")
@RequiredArgsConstructor
public class CheckIfLabyrinthIsInitializedController {

    private final ChatUserService chatUserService;
    private final ChatInboxService chatInboxService;
    private final CheckIfLabyrinthIsInitializedService checkIfLabyrinthIsInitializedService;

    @GetMapping("/is-initialized")
    public ResponseEntity<CheckIfLabyrinthIsInitializedResponseDTO> checkIfLabyrinthIsInitialized(
            Authentication authentication
    ) {
        UUID userId = chatUserService.getUserIdByAuthentication(authentication);
        UUID inboxId = chatInboxService.getChatInboxByUserId(userId);

        return ResponseEntity.ok(
                checkIfLabyrinthIsInitializedService.checkIfLabyrinthIsInitialized(
                        inboxId
                )
        );
    }

}
