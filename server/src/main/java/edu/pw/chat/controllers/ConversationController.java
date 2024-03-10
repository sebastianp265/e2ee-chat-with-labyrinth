package edu.pw.chat.controllers;

import edu.pw.chat.entitities.Conversation;
import edu.pw.chat.services.ConversationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/conversation")
@RequiredArgsConstructor
@Slf4j
public class ConversationController {

    private final ConversationService conversationService;

    @GetMapping("/{conversationId}")
    public Conversation getConversationById(@PathVariable Long conversationId) {
        log.debug("Getting all messages for conversation with id={}", conversationId);
        return conversationService.getConversationById(conversationId);
    }

    @GetMapping
    public List<Long> getConversationIdsByUserId(Long userId) {
        log.debug("Getting conversation ids for user with id = {}", userId);
        return conversationService.getConversationIdsByUserId(userId);
    }
}
