package edu.pw.safechat.auth.controllers;

import edu.pw.safechat.auth.dtos.LoginRequestDTO;
import edu.pw.safechat.auth.dtos.LoginResponseDTO;
import edu.pw.safechat.user.exceptions.ChatUserNotFoundException;
import edu.pw.safechat.user.internal.entities.ChatUser;
import edu.pw.safechat.user.internal.repositories.ChatUserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.context.SecurityContextHolderStrategy;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthenticationController {

    private final AuthenticationManager authenticationManager;
    private final SecurityContextRepository securityContextRepository;
    private final SecurityContextHolderStrategy securityContextHolderStrategy = SecurityContextHolder.getContextHolderStrategy();
    private final ChatUserRepository chatUserRepository;

    @PostMapping("/login")
    public LoginResponseDTO login(@RequestBody LoginRequestDTO loginRequestDTO,
                                  HttpServletRequest request,
                                  HttpServletResponse response) {
        Authentication authenticationRequest =
                UsernamePasswordAuthenticationToken.unauthenticated(
                        loginRequestDTO.getUsername(),
                        loginRequestDTO.getPassword()
                );
        Authentication authenticationResponse = authenticationManager
                .authenticate(authenticationRequest);

        UUID loggedUserId = chatUserRepository.findByUsername(loginRequestDTO.getUsername())
                .map(ChatUser::getId)
                .orElseThrow(ChatUserNotFoundException::new);

        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(authenticationResponse);

        securityContextHolderStrategy.setContext(context);
        securityContextRepository.saveContext(context, request, response);
        return LoginResponseDTO.builder()
                .userId(loggedUserId)
                .build();
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
