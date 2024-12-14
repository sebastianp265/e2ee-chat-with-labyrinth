package edu.pw.safechat.chat.internal.services;

import edu.pw.safechat.chat.internal.entities.ChatThread;
import edu.pw.safechat.chat.internal.entities.ChatThreadMember;
import edu.pw.safechat.chat.internal.repositories.ChatThreadMemberRepository;
import edu.pw.safechat.chat.internal.repositories.ChatThreadRepository;
import edu.pw.safechat.user.internal.services.ChatUserService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Example;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChatThreadService {

    private final ChatUserService chatUserService;
    private final ChatThreadRepository chatThreadRepository;
    private final ChatThreadMemberRepository chatThreadMemberRepository;

    public void checkIfUserIsMemberOfThread(UUID userId, UUID threadId) {
        ChatThreadMember probe = ChatThreadMember.builder()
                .userId(userId)
                .chatThread(
                        ChatThread.builder()
                                .id(threadId)
                                .build()
                )
                .build();

        Example<ChatThreadMember> example = Example.of(probe);

        if (!chatThreadMemberRepository.exists(example)) {
            throw new IllegalArgumentException();
        }
    }

    @Transactional
    public List<UUID> getMembersUUIDByThreadId(UUID threadId) {
        return chatThreadRepository.findById(threadId)
                .map(ChatThread::getMembers)
                .orElseThrow()
                .stream()
                .map(ChatThreadMember::getUserId)
                .toList();
    }

    @Transactional
    public ChatThread createNewThread(UUID creatorId, List<UUID> otherMemberIds) {
        List<UUID> memberIds = new ArrayList<>();
        memberIds.add(creatorId);
        memberIds.addAll(otherMemberIds);

        return createNewThread(memberIds);
    }

    private ChatThread createNewThread(List<UUID> memberIds) {
        chatUserService.validateUserIds(memberIds);

        ChatThread chatThread = chatThreadRepository.save(ChatThread.builder()
                .build()
        );

        List<ChatThreadMember> members = chatThreadMemberRepository.saveAll(
                memberIds.stream().distinct().map(id ->
                        ChatThreadMember.builder()
                                .userId(id)
                                .chatThread(chatThread)
                                .build()
                ).toList()
        );

        return ChatThread.builder()
                .id(chatThread.getId())
                .members(members)
                .build();
    }

    @Transactional
    public Map<UUID, String> getMembersVisibleNameByUserId(UUID threadId) {
        ChatThread chatThread = chatThreadRepository.findById(threadId)
                .orElseThrow();

        Map<UUID, String> result = chatThread.getMembers().stream()
                .filter(member -> member.getVisibleName() != null)
                .collect(Collectors.toMap(ChatThreadMember::getUserId, ChatThreadMember::getVisibleName));

        List<UUID> userIdsWithoutVisibleName = chatThread.getMembers().stream()
                .filter(member -> member.getVisibleName() == null)
                .map(ChatThreadMember::getUserId)
                .toList();

        chatUserService.getUsersByIds(userIdsWithoutVisibleName)
                .forEach(chatUser -> result.put(chatUser.getId(), chatUser.getVisibleName()));

        return result;
    }

}
