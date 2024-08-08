package edu.pw.chat.services;

import edu.pw.chat.dtos.ChatUserGetDTO;
import edu.pw.chat.entitities.Friend;
import edu.pw.chat.repository.FriendRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FriendService {

    private final FriendRepository friendRepository;

    public List<ChatUserGetDTO> getFriends(String username) {
        List<Friend> friendEntities =  friendRepository.findAllByUser_Username(username);

        return friendEntities.stream()
                .map(Friend::getFriend)
                .map(chatUser -> ChatUserGetDTO.builder()
                        .userId(chatUser.getId())
                        .visibleName(chatUser.getVisibleName())
                        .build())
                .toList();
    }
}
