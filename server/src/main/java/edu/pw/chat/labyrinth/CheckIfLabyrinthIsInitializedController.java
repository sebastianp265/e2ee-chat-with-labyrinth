package edu.pw.chat.labyrinth;

import edu.pw.chat.labyrinth.common.repositories.ChatInboxRepository;
import edu.pw.chat.user.services.ChatUserService;
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

    private final ChatInboxRepository chatInboxRepository;
    private final ChatUserService chatUserService;

    @GetMapping("/is-initialized")
    public ResponseEntity<CheckIfLabyrinthIsInitializedResponseDTO> checkIfLabyrinthIsInitialized(
            Authentication authentication
    ) {
        UUID userID = chatUserService.getUserIDByUsername(authentication.getName());
        return ResponseEntity.ok(
                new CheckIfLabyrinthIsInitializedResponseDTO(chatInboxRepository.existsByUserID(userID))
        );
    }

}
