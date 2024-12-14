package edu.pw.safechat.chat.controllers;


import edu.pw.safechat.chat.dtos.ChatThreadPreviewDTO;
import edu.pw.safechat.chat.internal.services.ChatService;
import edu.pw.safechat.chat.internal.services.ChatThreadService;
import edu.pw.safechat.chat.services.ChatInboxService;
import edu.pw.safechat.labyrinth.dtos.chat.ChatMessageGetDTO;
import edu.pw.safechat.labyrinth.dtos.chat.ChatMessagePostDTO;
import edu.pw.safechat.labyrinth.services.LabyrinthMessageStorageService;
import edu.pw.safechat.user.internal.services.ChatUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/chat-service/")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;
    private final LabyrinthMessageStorageService labyrinthMessageStorageService;
    private final ChatThreadService chatThreadService;
    private final ChatInboxService chatInboxService;
    private final ChatUserService chatUserService;

    @PostMapping("/threads/{threadId}/messages")
    public ResponseEntity<Void> storeMessage(
            @PathVariable UUID threadId,
            @RequestBody ChatMessagePostDTO chatMessagePostDTO,
            Authentication authentication
    ) {
        UUID userId = chatUserService.getUserIdByAuthentication(authentication);
        UUID inboxId = chatInboxService.getChatInboxByUserId(userId);

        chatThreadService.checkIfUserIsMemberOfThread(userId, threadId);
        labyrinthMessageStorageService.storeMessages(inboxId, threadId, List.of(chatMessagePostDTO));

        return ResponseEntity.ok().build();
    }

    // TODO: Handle pagination
    @GetMapping("/threads/{threadId}/messages")
    public ResponseEntity<List<ChatMessageGetDTO>> getMessagesForThread(
            @PathVariable UUID threadId,
            Authentication authentication
    ) {
        UUID userId = chatUserService.getUserIdByAuthentication(authentication);
        UUID inboxId = chatInboxService.getChatInboxByUserId(userId);

        return ResponseEntity.ok(
                labyrinthMessageStorageService.getMessagesByThreadId(inboxId, threadId, Pageable.unpaged())
        );
    }

    // TODO: Handle pagination
    @GetMapping("/threads/previews")
    public ResponseEntity<List<ChatThreadPreviewDTO>> getChatThreadPreviews(
            Authentication authentication
    ) {
        UUID userId = chatUserService.getUserIdByAuthentication(authentication);
        UUID inboxId = chatInboxService.getChatInboxByUserId(userId);

        return ResponseEntity.ok(
                chatService.getChatThreadPreviews(inboxId)
        );
    }

}
