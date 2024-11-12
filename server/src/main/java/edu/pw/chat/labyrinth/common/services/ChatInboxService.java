package edu.pw.chat.labyrinth.common.services;

import edu.pw.chat.labyrinth.common.repositories.ChatInboxRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ChatInboxService {

    private final ChatInboxRepository chatInboxRepository;

    public boolean existsByUserID(UUID userID) {
        return chatInboxRepository.existsByUserID(userID);
    }

}
