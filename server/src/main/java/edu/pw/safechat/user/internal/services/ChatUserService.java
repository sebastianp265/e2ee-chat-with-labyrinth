package edu.pw.safechat.user.internal.services;

import edu.pw.safechat.user.exceptions.ChatUserNotFoundException;
import edu.pw.safechat.user.internal.entities.ChatUser;
import edu.pw.safechat.user.internal.repositories.ChatUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.UUID;
import java.util.stream.StreamSupport;

@Service
@RequiredArgsConstructor
public class ChatUserService {

    private final ChatUserRepository chatUserRepository;

    public UUID getUserIdByAuthentication(Authentication authentication) {
        return getUserIdByUsername(authentication.getName());
    }

    public String getVisibleNameOfUserWithId(UUID userId) {
        return chatUserRepository.findById(userId)
                .map(ChatUser::getVisibleName)
                .orElseThrow(ChatUserNotFoundException::new);
    }

    public UUID getUserIdByUsername(String username) {
        return chatUserRepository
                .findByUsername(username)
                .orElseThrow(() -> new ChatUserNotFoundException(username))
                .getId();
    }

    public List<ChatUser> getUsersByIds(List<UUID> userIds) {
        List<ChatUser> foundChatUsers = StreamSupport.stream(
                chatUserRepository.findAllById(userIds).spliterator(),
                false
        ).toList();
        if (foundChatUsers.size() != userIds.size()) {
            List<UUID> foundIds = foundChatUsers.stream().map(ChatUser::getId).toList();
            List<UUID> userIdsNotFound = userIds
                    .stream()
                    .filter(uuid -> !foundIds.contains(uuid))
                    .toList();
            throw new IllegalArgumentException("User ids not found: " + String.join(
                    ",",
                    userIdsNotFound.stream().map(UUID::toString).toList()
            ));
        }

        return foundChatUsers;
    }

    public void validateUserIds(List<UUID> userIds) {
        List<UUID> distinctUserIds = userIds.stream().distinct().toList();
        if (distinctUserIds.size() != userIds.size()) {
            throw new IllegalArgumentException("Provided user ids must be distinct");
        }
        if (!chatUserRepository.existsAllById(new HashSet<>(userIds))) {
            throw new IllegalArgumentException("At least one user id doesn't exist");
        }
    }

}
