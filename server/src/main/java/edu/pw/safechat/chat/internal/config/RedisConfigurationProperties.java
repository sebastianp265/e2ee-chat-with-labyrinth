package edu.pw.safechat.chat.internal.config;

import lombok.Value;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties("app.temp-db")
@Value
public class RedisConfigurationProperties {

    String host;
    int port;
    String password;

}
