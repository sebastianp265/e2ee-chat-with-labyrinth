package edu.pw.safechat.labyrinth.internal.services.common;

import edu.pw.safechat.labyrinth.exceptions.EpochAccessDeniedException;
import edu.pw.safechat.labyrinth.internal.entities.Epoch;
import edu.pw.safechat.labyrinth.internal.entities.Labyrinth;
import edu.pw.safechat.labyrinth.internal.repositories.EpochRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Example;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class EpochService {

    private final EpochRepository epochRepository;

    public Epoch getEpochByIdAndLabyrinth(UUID epochId, Labyrinth labyrinth) {
        Example<Epoch> epochExample = Example.of(Epoch.builder()
                .id(epochId)
                .labyrinth(labyrinth)
                .build()
        );

        return epochRepository.findOne(epochExample)
                .orElseThrow(EpochAccessDeniedException::new);
    }

    public Epoch createAndSave(Labyrinth labyrinth, String sequenceId) {
        return epochRepository.save(
                Epoch.builder()
                        .labyrinth(labyrinth)
                        .sequenceId(sequenceId)
                        .build()
        );
    }

}
