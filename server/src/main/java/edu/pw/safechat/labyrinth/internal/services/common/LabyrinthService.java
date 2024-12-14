package edu.pw.safechat.labyrinth.internal.services.common;

import edu.pw.safechat.labyrinth.internal.entities.Labyrinth;
import edu.pw.safechat.labyrinth.internal.repositories.LabyrinthRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Example;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class LabyrinthService {

    private final LabyrinthRepository labyrinthRepository;

    public Labyrinth getByChatInboxId(UUID inboxId) {
        var prob = Labyrinth.builder()
                .chatInboxId(inboxId)
                .build();

        var example = Example.of(prob);

        return labyrinthRepository.findOne(example)
                .orElseThrow();
    }

    public boolean existsByChatInboxId(UUID inboxId) {
        var prob = Labyrinth.builder()
                .chatInboxId(inboxId)
                .build();

        var example = Example.of(prob);

        return labyrinthRepository.exists(example);
    }

    public Labyrinth createAndSave(UUID inboxId) {
        return labyrinthRepository.save(Labyrinth.builder()
                .chatInboxId(inboxId)
                .build()
        );
    }
}
