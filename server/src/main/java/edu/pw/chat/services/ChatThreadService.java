package edu.pw.chat.services;

import edu.pw.chat.dtos.ChatUserGetDTO;
import edu.pw.chat.dtos.ThreadPreviewGetDTO;
import edu.pw.chat.entitities.ChatInbox;
import edu.pw.chat.entitities.ChatThread;
import edu.pw.chat.entitities.ChatUser;
import edu.pw.chat.repository.ChatInboxRepository;
import edu.pw.chat.repository.ChatThreadRepository;
import edu.pw.chat.repository.ChatUserRepository;
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
public class ChatThreadService {

    private final MessageRepository messageRepository;
    private final ChatThreadRepository chatThreadRepository;
    private final ChatUserRepository chatUserRepository;
    private final ChatInboxRepository chatInboxRepository;

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

    public Map<Long, String> getMemberIdToNameMapByThreadId(Long threadId, String username) {
        if (!chatThreadRepository.isUserAMemberOfThread(threadId, username)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not a member of the conversation");
        }
        return chatThreadRepository.findAllMemberIdNamePairsByThreadId(threadId)
                .stream()
                .collect(Collectors.toMap(ChatUserGetDTO::getUserId,
                        ChatUserGetDTO::getVisibleName));
    }

    public ThreadPreviewGetDTO createThreadWithUser(Long userId, String username) {
        ChatInbox threadCreatorInbox = chatInboxRepository.findByOwner_Username(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Thread creator inbox not found"));

        ChatInbox userInboxToCreateThreadWith = chatInboxRepository.findByOwner_Id(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User inbox to create thread with not found"));

        if(chatThreadRepository.existsBySubscribedInboxes(Set.of(threadCreatorInbox, userInboxToCreateThreadWith))) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Thread already exists");
        }

        ChatThread newThread = ChatThread
                .builder()
                .subscribedInboxes(Set.of(threadCreatorInbox, userInboxToCreateThreadWith))
                .build();

        ChatThread savedThread = chatThreadRepository.save(newThread);

        return ThreadPreviewGetDTO.builder()
                .threadId(savedThread.getId())
                .threadName(threadCreatorInbox.getOwner().getVisibleName())
                .lastMessage(null)
                .lastMessageAuthorName(null)
                .build();
    }
}
