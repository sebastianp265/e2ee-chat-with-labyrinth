package edu.pw.safechat.chat.handlers;

import com.fasterxml.jackson.databind.ObjectMapper;
import edu.pw.safechat.chat.internal.entities.ChatThread;
import edu.pw.safechat.chat.internal.services.ChatMessageTemporaryStorageService;
import edu.pw.safechat.chat.internal.services.ChatThreadService;
import edu.pw.safechat.chat.payloads.received.GenericMessageReceived;
import edu.pw.safechat.chat.payloads.received.NewChatMessageReceivedPayload;
import edu.pw.safechat.chat.payloads.received.NewChatThreadReceivedPayload;
import edu.pw.safechat.chat.payloads.tosend.GenericMessageToSend;
import edu.pw.safechat.chat.payloads.tosend.NewChatMessageToSendPayload;
import edu.pw.safechat.chat.payloads.tosend.NewChatThreadToSendPayload;
import edu.pw.safechat.chat.payloads.tosend.WebSocketChatMessage;
import edu.pw.safechat.user.internal.services.ChatUserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Component
@RequiredArgsConstructor
public class ChatWebSocketHandler extends TextWebSocketHandler {

    private final ConcurrentHashMap<UUID, List<WebSocketSession>> currentSessions = new ConcurrentHashMap<>();
    private final ObjectMapper mapper = new ObjectMapper();
    private final ChatUserService chatUserService;
    private final ChatThreadService chatThreadService;

    private final ChatMessageTemporaryStorageService messageTemporaryStorageService;

    @Override
    public void afterConnectionEstablished(@NonNull WebSocketSession session) throws Exception {
        UUID userId = getUserIdFromSession(session);

        currentSessions.computeIfAbsent(userId, k -> new ArrayList<>()).add(session);
        for (String m : messageTemporaryStorageService.getMessages(userId)) {
            var tm = new TextMessage(m);
            session.sendMessage(tm);
        }
    }

    // TODO: Handle possible exceptions
    @Override
    protected void handleTextMessage(@NonNull WebSocketSession session, @NonNull TextMessage message) throws Exception {
        UUID userId = getUserIdFromSession(session);

        GenericMessageReceived receivedMessage = mapper.readValue(message.getPayload(), GenericMessageReceived.class);

        switch (receivedMessage.type()) {
            case "NEW_CHAT_MESSAGE" -> handleNewChatMessage(userId, receivedMessage);
            case "NEW_CHAT_THREAD" -> handleNewChatThread(receivedMessage, userId);
            default -> throw new IllegalStateException("Unexpected value: " + receivedMessage);
        }
    }

    private void handleNewChatThread(GenericMessageReceived receivedMessage, UUID userId) throws Exception {
        NewChatThreadReceivedPayload payload = mapper.treeToValue(receivedMessage.payload(), NewChatThreadReceivedPayload.class);
        ChatThread createdThread = chatThreadService.createNewThread(userId, payload.otherMemberUserIds());

        UUID id = UUID.randomUUID();
        long timestamp = Instant.now().toEpochMilli();

        var messageToSend = new GenericMessageToSend(
                "NEW_CHAT_THREAD",
                new NewChatThreadToSendPayload(
                        createdThread.getId(),
                        createdThread.getName(),
                        new WebSocketChatMessage(
                                // TODO: consider almost impossible uuid collisions
                                id,
                                userId,
                                payload.initialMessageContent(),
                                timestamp
                        ),
                        chatThreadService.getMembersVisibleNameByUserId(createdThread.getId())
                )
        );
        var usersToSendTo = chatThreadService.getMembersUUIDByThreadId(createdThread.getId());

        sendMessages(usersToSendTo, messageToSend, timestamp);
    }

    private void handleNewChatMessage(UUID authorId, GenericMessageReceived receivedMessage) throws Exception {
        NewChatMessageReceivedPayload payload = mapper.treeToValue(receivedMessage.payload(), NewChatMessageReceivedPayload.class);
        UUID id = UUID.randomUUID();
        long timestamp = Instant.now().toEpochMilli();
        var messageToSend = new GenericMessageToSend(
                "NEW_CHAT_MESSAGE",
                new NewChatMessageToSendPayload(
                        payload.threadId(),
                        new WebSocketChatMessage(
                                // TODO: consider almost impossible uuid collisions
                                id,
                                authorId,
                                payload.content(),
                                timestamp
                        )
                )
        );
        var usersToSendTo = chatThreadService.getMembersUUIDByThreadId(payload.threadId());
        sendMessages(usersToSendTo, messageToSend, timestamp);
    }

    private void sendMessages(List<UUID> usersToSendTo, GenericMessageToSend messageToSend, long timestamp) throws Exception {
        var textMessageToSend = new TextMessage(mapper.writeValueAsString(messageToSend));

        for (UUID userIdToSendTo : usersToSendTo) {
            messageTemporaryStorageService.addMessage(userIdToSendTo, textMessageToSend.getPayload(), timestamp);
            List<WebSocketSession> sessions = currentSessions.get(userIdToSendTo);
            if (sessions != null) {
                for (WebSocketSession s : currentSessions.get(userIdToSendTo)) {
                    s.sendMessage(textMessageToSend);
                }
            }
        }
    }

    @Override
    public void afterConnectionClosed(@NonNull WebSocketSession session, @NonNull CloseStatus status) throws Exception {
        UUID userId = getUserIdFromSession(session);

        List<WebSocketSession> sessions = currentSessions.get(userId);
        if (sessions != null) {
            sessions.remove(session);
            if (sessions.isEmpty()) {
                currentSessions.remove(userId);
            }
        }
    }

    private UUID getUserIdFromSession(WebSocketSession session) {
        return chatUserService.getUserIdByUsername(Objects.requireNonNull(session.getPrincipal()).getName());
    }

}
