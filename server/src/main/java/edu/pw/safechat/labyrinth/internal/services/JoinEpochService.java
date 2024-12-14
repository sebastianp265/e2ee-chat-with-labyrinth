package edu.pw.safechat.labyrinth.internal.services;

import edu.pw.safechat.labyrinth.dtos.GetNewestEpochSequenceIdResponseDTO;
import edu.pw.safechat.labyrinth.exceptions.EpochAccessDeniedException;
import edu.pw.safechat.labyrinth.internal.entities.Epoch;
import edu.pw.safechat.labyrinth.internal.entities.Labyrinth;
import edu.pw.safechat.labyrinth.internal.repositories.EpochRepository;
import edu.pw.safechat.labyrinth.internal.services.common.LabyrinthService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class JoinEpochService {

    private final EpochRepository epochRepository;
    private final LabyrinthService labyrinthService;

    public GetNewestEpochSequenceIdResponseDTO getNewestEpochSequenceId(UUID inboxId) {
        Labyrinth labyrinth = labyrinthService.getByChatInboxId(inboxId);

        return new GetNewestEpochSequenceIdResponseDTO(
                epochRepository.findTopByLabyrinthOrderBySequenceIdDesc(labyrinth)
                        .map(Epoch::getSequenceId)
                        .orElseThrow(EpochAccessDeniedException::new)
        );
    }
}
