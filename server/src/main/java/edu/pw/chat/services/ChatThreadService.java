package edu.pw.chat.services;

import edu.pw.chat.dtos.ChatMemberIdNamePair;
import edu.pw.chat.dtos.ThreadPreviewGetDTO;
import edu.pw.chat.entitities.ChatUser;
import edu.pw.chat.repository.ChatThreadRepository;
import edu.pw.chat.repository.ChatUserRepository;
import edu.pw.chat.repository.MessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChatThreadService {

    private final MessageRepository messageRepository;
    private final ChatThreadRepository chatThreadRepository;
    private final ChatUserRepository chatUserRepository;

    public List<ThreadPreviewGetDTO> getConversationPreviews(String username) {
        List<ThreadPreviewGetDTO> threadPreviewGetDTOS = messageRepository
                .getPreviewsOfThreadByUsername(username);
        String visibleNameOfLoggedUser = chatUserRepository.findByUsername(username)
                .map(ChatUser::getVisibleName)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR));

        for (ThreadPreviewGetDTO threadPreview : threadPreviewGetDTOS) {
            if (threadPreview.getThreadName() == null) {
                String conversationName = chatThreadRepository
                        .getNonGroupConversationName(
                                threadPreview.getThreadId(),
                                username
                        )
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR));
                threadPreview.setThreadName(conversationName);
            }
            if (threadPreview.getLastMessageAuthorName().equals(visibleNameOfLoggedUser)) {
                threadPreview.setLastMessageAuthorName("You");
            }
        }

        return threadPreviewGetDTOS;
    }

    public Map<Long, String> getMembersIdToNameMapByThreadId(Long threadId, String username) {
        if (!chatThreadRepository.isUserAMemberOfThread(threadId, username)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not a member of the conversation");
        }
        return chatThreadRepository.findAllMemberIdNamePairsByThreadId(threadId)
                .stream()
                .collect(Collectors.toMap(ChatMemberIdNamePair::getUserId,
                        ChatMemberIdNamePair::getVisibleName));
    }
}
