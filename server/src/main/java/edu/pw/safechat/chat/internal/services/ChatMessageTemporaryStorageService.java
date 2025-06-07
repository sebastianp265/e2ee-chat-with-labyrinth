package edu.pw.safechat.chat.internal.services;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisCallback;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.util.Objects;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ChatMessageTemporaryStorageService {

    private final StringRedisTemplate redisTemplate;

    public Set<String> getMessages(UUID userId) {
        return Objects.requireNonNull(
                redisTemplate.opsForZSet().range(
                        "user:" + userId,
                        0,
                        -1
                )
        );
    }

    public void addMessage(UUID userIdToSendTo, String message, long timestamp) {
        redisTemplate.opsForZSet().add(
                "user:" + userIdToSendTo,
                message,
                timestamp
        );
    }

    public void removeMessage(UUID userIdToSendTo, long timestamp) {
        redisTemplate.opsForZSet().removeRangeByScore("user:" + userIdToSendTo, timestamp, timestamp);
    }

    // TODO: remove after testing
    public void removeAllMessages() {
        redisTemplate.execute((RedisCallback<Object>) connection -> {
            connection.serverCommands().flushDb();
            return null;
        });
    }

}
