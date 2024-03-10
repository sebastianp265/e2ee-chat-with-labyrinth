package edu.pw.chat.services;

import edu.pw.chat.entitities.Conversation;
import edu.pw.chat.repository.ConversationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ConversationService {

    private final ConversationRepository conversationRepository;

    public Conversation getConversationById(Long conversationId) {
        return conversationRepository.findById(conversationId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Conversation with id = " +
                        conversationId + " doesn't exist"));
    }

    public List<Long> getConversationIdsByUserId(Long userId) {
        return conversationRepository.findConversationsByUserInfosId(userId)
                .stream()
                .map(Conversation::getConversationId)
                .toList();
    }
}
