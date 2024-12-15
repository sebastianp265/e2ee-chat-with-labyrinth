package edu.pw.safechat.labyrinth.internal.entities;

import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.UUID;

@Embeddable
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessageUniqueId implements Serializable {
    private UUID inboxId;
    private UUID messageId;
}
