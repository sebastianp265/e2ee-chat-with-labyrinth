package edu.pw.chat.user.services;

import edu.pw.chat.user.exceptions.ChatUserNotFoundException;
import edu.pw.chat.user.repositories.ChatUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ChatUserService {

    private final ChatUserRepository chatUserRepository;

    public UUID getUserIDByUsername(String username) {
        return chatUserRepository
                .findByUsername(username)
                .orElseThrow(() -> new ChatUserNotFoundException(username))
                .getId();
    }

}
