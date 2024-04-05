package edu.pw.chat.services;

import edu.pw.chat.dtos.ConversationMessagePostDTO;
import edu.pw.chat.entitities.ChatUser;
import edu.pw.chat.entitities.Conversation;
import edu.pw.chat.entitities.Message;
import edu.pw.chat.repository.ChatUserRepository;
import edu.pw.chat.repository.ConversationRepository;
import edu.pw.chat.repository.MessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;

@Service
@RequiredArgsConstructor
public class MessageService {

    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;
    private final ChatUserRepository chatUserRepository;

    public void sendMessage(ConversationMessagePostDTO conversationMessagePostDTO, String senderUsername) {
        Long destinationConversationId = conversationMessagePostDTO.getDestinationConversationId();
        String messageContent = conversationMessagePostDTO.getContent();

        if (!conversationRepository.isUserAMemberOfConversation(destinationConversationId,
                senderUsername)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You don't have access to this conversation");
        }
        Conversation conversation = conversationRepository.findById(destinationConversationId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Conversation with given id doesn't exist"));

        ChatUser sender = chatUserRepository.findByName(senderUsername)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR));

        Message messageToSave = Message.builder()
                .conversationId(destinationConversationId)
                .content(messageContent)
                .author(sender)
                .sentAt(Instant.now())
                .build();

        Message savedMessage = messageRepository.save(messageToSave);
        conversation.getMessages().add(savedMessage);
        conversationRepository.save(conversation);
    }
}
