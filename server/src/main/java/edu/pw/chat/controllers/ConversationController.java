package edu.pw.chat.controllers;

import edu.pw.chat.services.ConversationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/conversation")
@RequiredArgsConstructor
@Slf4j
public class ConversationController {

    private final ConversationService conversationService;


}
