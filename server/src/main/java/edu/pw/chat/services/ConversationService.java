package edu.pw.chat.services;

import edu.pw.chat.dtos.ConversationGetDTO;
import edu.pw.chat.dtos.ConversationPreviewGetDTO;
import edu.pw.chat.dtos.MessageGetDTO;
import edu.pw.chat.entitities.ChatUser;
import edu.pw.chat.repository.ConversationRepository;
import edu.pw.chat.repository.MessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ConversationService {

    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;

    public List<ConversationPreviewGetDTO> getConversationPreviews(String username) {
        List<ConversationPreviewGetDTO> conversationPreviewGetDTOS = conversationRepository.findConversationPreviewsForUsername(username);
        for (ConversationPreviewGetDTO conversationPreview : conversationPreviewGetDTOS) {
            if (conversationPreview.getConversationName() == null) {
                String conversationName = conversationRepository
                        .getNonGroupConversationName(
                                conversationPreview.getConversationId(),
                                username
                        )
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                                "Error when getting conversation name for non group conversation"));
                conversationPreview.setConversationName(conversationName);
            }
            if(conversationPreview.getLastMessageAuthorName().equals(username)) {
                conversationPreview.setLastMessageAuthorName("You");
            }
        }

        return conversationPreviewGetDTOS;
    }

    public ConversationGetDTO getConversation(Long conversationId, String username) {
        if(!conversationRepository.isUserAMemberOfConversation(conversationId, username)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not a member of the conversation");
        }

        List<MessageGetDTO> messages = messageRepository.findAllMessagesByConversationId(conversationId);
        Set<ChatUser> members = conversationRepository.getChatMembersByConversationId(conversationId);

        Map<Long, String> userIdToName = members.stream()
                .collect(Collectors.toMap(ChatUser::getId, ChatUser::getName));

        return ConversationGetDTO.builder()
                .messages(messages)
                .userIdToName(userIdToName)
                .build();
    }
}
