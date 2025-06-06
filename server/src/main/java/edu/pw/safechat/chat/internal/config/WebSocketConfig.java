package edu.pw.safechat.chat.internal.config;

import edu.pw.safechat.chat.handlers.ChatWebSocketHandler;
import edu.pw.safechat.common.config.ClientConfigurationProperties;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;
import org.springframework.web.socket.server.support.HttpSessionHandshakeInterceptor;

@Configuration
@EnableWebSocket
@RequiredArgsConstructor
public class WebSocketConfig implements WebSocketConfigurer {

    private final ChatWebSocketHandler chatWebSocketHandler;

    private final ClientConfigurationProperties clientConfigurationProperties;

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry
                .addHandler(chatWebSocketHandler, "/api/ws")
                .addInterceptors(new HttpSessionHandshakeInterceptor())
                .setAllowedOrigins(clientConfigurationProperties.getUrl());
    }

}
