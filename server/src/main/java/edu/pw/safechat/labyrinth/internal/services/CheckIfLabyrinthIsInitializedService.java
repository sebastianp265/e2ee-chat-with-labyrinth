package edu.pw.safechat.labyrinth.internal.services;

import edu.pw.safechat.labyrinth.dtos.CheckIfLabyrinthIsInitializedResponseDTO;
import edu.pw.safechat.labyrinth.internal.services.common.LabyrinthService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CheckIfLabyrinthIsInitializedService {

    private final LabyrinthService labyrinthService;

    public CheckIfLabyrinthIsInitializedResponseDTO checkIfLabyrinthIsInitialized(UUID inboxId) {
        return new CheckIfLabyrinthIsInitializedResponseDTO(
                labyrinthService.existsByChatInboxId(inboxId)
        );
    }
}
