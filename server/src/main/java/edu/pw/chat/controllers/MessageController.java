package edu.pw.chat.controllers;

import edu.pw.chat.dtos.ConversationMessagePostDTO;
import edu.pw.chat.services.MessageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;

@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
@Slf4j
public class MessageController {

    private final MessageService messageService;

    @PostMapping
    public void sendMessageToConversation(@RequestBody ConversationMessagePostDTO conversationMessagePostDTO, Principal principal) {
        log.debug("Sending message from user with name={} to conversation with id = {}",
                principal.getName(), conversationMessagePostDTO.getDestinationConversationId());
        messageService.sendMessage(conversationMessagePostDTO, principal.getName());
    }


}
