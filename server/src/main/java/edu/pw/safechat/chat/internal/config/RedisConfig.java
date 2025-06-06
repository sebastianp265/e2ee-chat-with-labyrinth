package edu.pw.safechat.chat.internal.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.connection.RedisStandaloneConfiguration;
import org.springframework.data.redis.connection.lettuce.LettuceConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;

@Configuration
@RequiredArgsConstructor
public class RedisConfig {

    private final RedisConfigurationProperties redisConfigurationProperties;

    @Bean
    LettuceConnectionFactory redisConnectionFactory() {
        var redisConfig = new RedisStandaloneConfiguration(redisConfigurationProperties.getHost(), redisConfigurationProperties.getPort());
        redisConfig.setPassword(redisConfigurationProperties.getPassword());

        return new LettuceConnectionFactory(redisConfig);
    }

    @Bean
    RedisTemplate<String, String> redisTemplate(RedisConnectionFactory redisConnectionFactory) {
        RedisTemplate<String, String> redisTemplate = new RedisTemplate<>();
        redisTemplate.setConnectionFactory(redisConnectionFactory);
        return redisTemplate;
    }

}
