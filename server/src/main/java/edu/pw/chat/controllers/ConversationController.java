package edu.pw.chat.controllers;

import edu.pw.chat.dtos.ConversationGetDTO;
import edu.pw.chat.dtos.ConversationPreviewGetDTO;
import edu.pw.chat.services.ConversationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/conversation")
@RequiredArgsConstructor
@Slf4j
public class ConversationController {

    private final ConversationService conversationService;

    @GetMapping
    public List<ConversationPreviewGetDTO> getConversationPreviews(Principal principal) {
        String username = principal.getName();
        log.debug("Getting conversation previews for user: {}", username);
        return conversationService.getConversationPreviews(username);
    }

    @GetMapping("/{conversationId}")
    public ConversationGetDTO getConversation(@PathVariable Long conversationId, Principal principal){
        String username = principal.getName();
        log.debug("Getting conversation with conversationId={} for user: {}", conversationId, username);

        return conversationService.getConversation(conversationId, username);
    }

}
