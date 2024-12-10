package edu.pw.safechat.labyrinth.controllers;

import edu.pw.safechat.chat.services.ChatInboxService;
import edu.pw.safechat.labyrinth.dtos.GetNewerEpochJoinDataResponseDTO;
import edu.pw.safechat.labyrinth.dtos.GetNewestEpochSequenceIdResponseDTO;
import edu.pw.safechat.labyrinth.dtos.GetOlderEpochJoinDataResponseDTO;
import edu.pw.safechat.labyrinth.internal.services.JoinEpochService;
import edu.pw.safechat.user.internal.services.ChatUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigInteger;
import java.util.UUID;

@RestController
@RequestMapping("/api/labyrinth/epochs")
@RequiredArgsConstructor
public class JoinEpochController {

    private final JoinEpochService joinEpochService;
    private final ChatUserService chatUserService;
    private final ChatInboxService chatInboxService;

    @GetMapping("/by-sequence-id/{newerEpochSequenceId}/newer-epoch-join-data")
    public ResponseEntity<GetNewerEpochJoinDataResponseDTO> getNewerEpochJoinData(
            @PathVariable BigInteger newerEpochSequenceId,
            Authentication authentication
    ) {
        throw new UnsupportedOperationException("Not implemented yet");
    }

    @GetMapping("/by-sequence-id/{olderEpochSequenceId}/older-epoch-join-data")
    public ResponseEntity<GetOlderEpochJoinDataResponseDTO> getOlderEpochJoinData(
            @PathVariable BigInteger olderEpochSequenceId,
            Authentication authentication
    ) {
        throw new UnsupportedOperationException("Not implemented yet");
    }

    @GetMapping("/newest-sequence-id")
    public ResponseEntity<GetNewestEpochSequenceIdResponseDTO> getNewestEpochSequenceId(
            Authentication authentication
    ) {
        UUID userId = chatUserService.getUserIdByAuthentication(authentication);
        UUID inboxId = chatInboxService.getChatInboxByUserId(userId);

        return ResponseEntity.ok(
                joinEpochService.getNewestEpochSequenceId(inboxId)
        );
    }
}
