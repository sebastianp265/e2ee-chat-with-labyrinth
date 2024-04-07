package edu.pw.chat.controllers;

import edu.pw.chat.dtos.ThreadPreviewGetDTO;
import edu.pw.chat.services.ChatThreadService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/threads")
@RequiredArgsConstructor
@Slf4j
public class ChatThreadController {

    private final ChatThreadService chatThreadService;

    @GetMapping
    public List<ThreadPreviewGetDTO> getPreviewsOfThreads(Principal principal) {
        String username = principal.getName();
        log.debug("Getting previews of threads for user with name={}", username);
        return chatThreadService.getConversationPreviews(username);
    }

    @GetMapping("/{threadId}/members")
    public Map<Long, String> getMembersIdToNameMapByThreadId(@PathVariable Long threadId,
                                                      Principal principal) {
        String username = principal.getName();
        log.debug("Getting members id to name map by threadId = {} for user with name = {}", threadId, username);
        return chatThreadService.getMembersIdToNameMapByThreadId(threadId, username);
    }

}
