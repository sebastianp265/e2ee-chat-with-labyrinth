package edu.pw.safechat.user.internal.services;

import edu.pw.safechat.user.dtos.FriendDTO;
import edu.pw.safechat.user.internal.entities.FriendRelation;
import edu.pw.safechat.user.internal.mappers.FriendMapper;
import edu.pw.safechat.user.internal.repositories.FriendRelationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FriendService {

    private final ChatUserService chatUserService;
    private final FriendRelationRepository friendRelationRepository;
    private final FriendMapper friendMapper;

    public List<FriendDTO> getFriends(Authentication authentication) {
        UUID userId = chatUserService.getUserIdByAuthentication(authentication);
        return friendRelationRepository.findAllByChatUser_Id(userId)
                .stream()
                .map(FriendRelation::getChatUserFriend)
                .map(friendMapper::toDTO)
                .collect(Collectors.toList());
    }
}
