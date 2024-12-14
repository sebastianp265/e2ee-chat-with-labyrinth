package edu.pw.safechat.user.controllers;

import edu.pw.safechat.user.dtos.FriendDTO;
import edu.pw.safechat.user.internal.services.FriendService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/user-service")
@RequiredArgsConstructor
public class FriendController {

    private final FriendService friendService;

    @GetMapping("/friends")
    public ResponseEntity<List<FriendDTO>> getFriends(Authentication authentication) {

        return ResponseEntity.ok(
                friendService.getFriends(authentication)
        );
    }
}
