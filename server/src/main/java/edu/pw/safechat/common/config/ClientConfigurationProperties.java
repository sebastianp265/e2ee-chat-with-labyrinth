package edu.pw.safechat.common.config;

import lombok.Value;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties("app.client")
@Value
public class ClientConfigurationProperties {

    String url;
}
