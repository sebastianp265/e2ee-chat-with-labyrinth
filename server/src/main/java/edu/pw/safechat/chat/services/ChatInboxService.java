package edu.pw.safechat.chat.services;

import edu.pw.safechat.chat.exceptions.ChatInboxNotFoundException;
import edu.pw.safechat.chat.internal.entities.ChatInbox;
import edu.pw.safechat.chat.internal.repositories.ChatInboxRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ChatInboxService {

    private final ChatInboxRepository chatInboxRepository;

    public UUID getChatInboxByUserId(UUID userId) {
        return chatInboxRepository.findByUserId(userId)
                .map(ChatInbox::getId)
                .orElseThrow(ChatInboxNotFoundException::new);
    }

}
