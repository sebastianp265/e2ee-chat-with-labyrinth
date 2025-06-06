package edu.pw.safechat.labyrinth.internal.config;

import lombok.Value;
import org.springframework.boot.context.properties.ConfigurationProperties;

import java.time.Duration;

@ConfigurationProperties("app.labyrinth")
@Value
public class LabyrinthConfigurationProperties {

    Duration maxDeviceInactivity;
}
