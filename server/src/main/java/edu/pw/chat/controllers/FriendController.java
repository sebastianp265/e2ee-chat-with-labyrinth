package edu.pw.chat.controllers;

import edu.pw.chat.dtos.ChatUserGetDTO;
import edu.pw.chat.services.FriendService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/friends")
@RequiredArgsConstructor
public class FriendController {

    private final FriendService friendService;

    @GetMapping("")
    public List<ChatUserGetDTO> getFriends(Principal principal) {
        String username = principal.getName();
        log.debug("Getting friends for {}", username);
        return friendService.getFriends(username);
    }
}
