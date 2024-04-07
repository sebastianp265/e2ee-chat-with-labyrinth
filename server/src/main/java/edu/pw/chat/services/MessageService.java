package edu.pw.chat.services;

import edu.pw.chat.dtos.MessageGetDTO;
import edu.pw.chat.dtos.MessagePostDTO;
import edu.pw.chat.entitities.ChatInbox;
import edu.pw.chat.entitities.ChatThread;
import edu.pw.chat.entitities.ChatUser;
import edu.pw.chat.entitities.Message;
import edu.pw.chat.repository.ChatThreadRepository;
import edu.pw.chat.repository.ChatUserRepository;
import edu.pw.chat.repository.MessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MessageService {

    private final ChatThreadRepository chatThreadRepository;
    private final MessageRepository messageRepository;
    private final ChatUserRepository chatUserRepository;

    public void sendMessage(MessagePostDTO messagePostDTO, Long destinationThreadId, String loggedUsername) {
        if (!chatThreadRepository.isUserAMemberOfThread(destinationThreadId, loggedUsername)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You don't have access to this thread");
        }
        ChatUser sender = chatUserRepository.findByUsername(loggedUsername)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR));

        ChatThread destinationThread = chatThreadRepository.findById(destinationThreadId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Thread with given id doesn't exist"));

        String messageContent = messagePostDTO.getContent();

        List<Message> messagesToSave = new ArrayList<>();
        for (ChatInbox chatInbox : destinationThread.getSubscribedInboxes()) {
            Message messageToSave = Message.builder()
                    .thread(destinationThread)
                    .inbox(chatInbox)
                    .author(sender)
                    .timestamp(Instant.now())
                    .messageData(messageContent)
                    .build();
            messagesToSave.add(messageToSave);
        }

        messageRepository.saveAll(messagesToSave);
    }

    public List<MessageGetDTO> getMessagesByThread(Long inboxId, Long threadId, String loggedUsername) {
        if (!chatThreadRepository.isUserAMemberOfThread(threadId, loggedUsername)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You don't have access to this thread");
        }
        return messageRepository.findAllMessagesByInboxIdAndThreadId(inboxId, threadId);
    }
}
