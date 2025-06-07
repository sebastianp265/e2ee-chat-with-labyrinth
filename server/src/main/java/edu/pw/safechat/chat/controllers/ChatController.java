package edu.pw.safechat.chat.controllers;


import edu.pw.safechat.chat.dtos.ChatThreadPreviewDTO;
import edu.pw.safechat.chat.handlers.ChatWebSocketHandler;
import edu.pw.safechat.chat.internal.repositories.ChatInboxRepository;
import edu.pw.safechat.chat.internal.repositories.ChatThreadMemberRepository;
import edu.pw.safechat.chat.internal.repositories.ChatThreadRepository;
import edu.pw.safechat.chat.internal.services.ChatMessageTemporaryStorageService;
import edu.pw.safechat.chat.internal.services.ChatService;
import edu.pw.safechat.chat.internal.services.ChatThreadService;
import edu.pw.safechat.chat.services.ChatInboxService;
import edu.pw.safechat.labyrinth.dtos.chat.ChatMessageGetDTO;
import edu.pw.safechat.labyrinth.dtos.chat.ChatMessagePostDTO;
import edu.pw.safechat.labyrinth.internal.entities.EncryptedEpochEntropyForVirtualDeviceRepository;
import edu.pw.safechat.labyrinth.internal.repositories.*;
import edu.pw.safechat.labyrinth.services.LabyrinthMessageStorageService;
import edu.pw.safechat.user.internal.repositories.ChatUserRepository;
import edu.pw.safechat.user.internal.repositories.FriendRelationRepository;
import edu.pw.safechat.user.internal.services.ChatUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.session.SessionInformation;
import org.springframework.security.core.session.SessionRegistry;
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
    private final ChatMessageTemporaryStorageService chatMessageTemporaryStorageService;

    private final ChatWebSocketHandler chatWebSocketHandler;
    private final ChatMessageRepository chatMessageRepository;
    private final DeviceEpochMembershipProofRepository deviceEpochMembershipProofRepository;
    private final EncryptedEpochEntropyForDeviceRepository encryptedEpochEntropyForDeviceRepository;
    private final EncryptedEpochEntropyForVirtualDeviceRepository encryptedEpochEntropyForVirtualDeviceRepository;
    private final DeviceRepository deviceRepository;
    private final VirtualDeviceEncryptedRecoverySecretsRepository virtualDeviceEncryptedRecoverySecretsRepository;
    private final VirtualDeviceEpochMembershipProofRepository virtualDeviceEpochMembershipProofRepository;
    private final VirtualDeviceRepository virtualDeviceRepository;
    private final ChatInboxRepository chatInboxRepository;
    private final EpochRepository epochRepository;
    private final LabyrinthRepository labyrinthRepository;
    private final FriendRelationRepository friendRelationRepository;
    private final ChatUserRepository chatUserRepository;
    private final ChatThreadRepository chatThreadRepository;
    private final ChatThreadMemberRepository chatThreadMemberRepository;

    private final SessionRegistry sessionRegistry;

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
        chatMessageTemporaryStorageService.removeMessage(userId, chatMessagePostDTO.timestamp());
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

    // TODO: Remove after testing
    @PostMapping("/reset")
    public void resetAppState() {
        chatWebSocketHandler.resetAllSessions();
        chatMessageTemporaryStorageService.removeAllMessages();

        chatMessageRepository.deleteAll();
        deviceEpochMembershipProofRepository.deleteAll();
        encryptedEpochEntropyForDeviceRepository.deleteAll();
        encryptedEpochEntropyForVirtualDeviceRepository.deleteAll();
        deviceRepository.deleteAll();
        virtualDeviceEncryptedRecoverySecretsRepository.deleteAll();
        virtualDeviceEpochMembershipProofRepository.deleteAll();
        virtualDeviceRepository.deleteAll();
        epochRepository.deleteAll();
        labyrinthRepository.deleteAll();
//        friendRelationRepository.deleteAll();
//        chatUserRepository.deleteAll();
        chatThreadMemberRepository.deleteAll();
        chatThreadRepository.deleteAll();
//        chatInboxRepository.deleteAll();

        List<Object> allPrincipals = sessionRegistry.getAllPrincipals();
        for (Object principal : allPrincipals) {
            List<SessionInformation> sessionsInfo = sessionRegistry.getAllSessions(principal, false);
            for (SessionInformation sessionInfo : sessionsInfo) {
                sessionInfo.expireNow();
            }
        }
    }

}
