package edu.pw.chat.controllers;

import edu.pw.chat.dtos.MessageGetDTO;
import edu.pw.chat.dtos.MessagePostDTO;
import edu.pw.chat.services.MessageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
@Slf4j
public class MessageController {

    private final MessageService messageService;

    @GetMapping("/inbox/{inboxId}/thread/{threadId}")
    public List<MessageGetDTO> getMessagesByThread(@PathVariable Long inboxId,
                                                   @PathVariable Long threadId,
                                                   Principal principal) {
        String username = principal.getName();
        log.debug("Getting messages by thread with id = {} for user with name = {}", threadId, username);
        return messageService.getMessagesByThread(inboxId, threadId, username);
    }

    @PostMapping("/thread/{threadId}")
    public void sendMessageToThread(@RequestBody MessagePostDTO messagePostDTO,
                                    @PathVariable Long threadId,
                                    Principal principal) {
        log.debug("Sending message from user with name={} to thread with id = {}",
                principal.getName(), threadId);
        messageService.sendMessage(messagePostDTO, threadId, principal.getName());
    }


}
