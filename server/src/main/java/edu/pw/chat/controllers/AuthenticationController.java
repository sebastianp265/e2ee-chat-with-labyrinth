package edu.pw.chat.controllers;

import edu.pw.chat.dtos.LoginRequestPostDTO;
import edu.pw.chat.entitities.ChatUser;
import edu.pw.chat.repository.ChatUserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.context.SecurityContextHolderStrategy;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthenticationController {

    private final AuthenticationManager authenticationManager;
    private final SecurityContextRepository securityContextRepository;
    private final SecurityContextHolderStrategy securityContextHolderStrategy = SecurityContextHolder.getContextHolderStrategy();
    private final ChatUserRepository chatUserRepository;

    @PostMapping("/login")
    public Long login(@RequestBody LoginRequestPostDTO loginRequestPostDTO,
                      HttpServletRequest request,
                      HttpServletResponse response) {
        Authentication authenticationRequest =
                UsernamePasswordAuthenticationToken.unauthenticated(
                        loginRequestPostDTO.getUsername(),
                        loginRequestPostDTO.getPassword());
        Authentication authenticationResponse = authenticationManager
                .authenticate(authenticationRequest);

        Long loggedUserId = chatUserRepository.findByName(loginRequestPostDTO.getUsername())
                .map(ChatUser::getId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                        "User exists in SecurityContextRepository and not in ChatUserRepository"));

        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(authenticationResponse);

        securityContextHolderStrategy.setContext(context);
        securityContextRepository.saveContext(context, request, response);
        return loggedUserId;
    }

    public record Hello(String name,
                        String principal,
                        String details,
                        String credentials,
                        List<String> authorities,
                        String sessionId) {
    }

    @GetMapping("/hello")
    public Hello hello(HttpSession httpSession) {
        SecurityContext securityContext = securityContextHolderStrategy.getContext();
        Authentication authentication = securityContext.getAuthentication();
        String name = authentication.getName();
        String principal = authentication.getPrincipal() == null ? null : authentication.getPrincipal().toString();
        String details = authentication.getDetails() == null ? null : authentication.getDetails().toString();
        String credentials = authentication.getCredentials() == null ? null : authentication.getCredentials().toString();
        List<String> authorities = authentication.getAuthorities().stream().map(GrantedAuthority::getAuthority).toList();

        return new Hello(name, principal, details, credentials, authorities, httpSession.getId());
    }
}
