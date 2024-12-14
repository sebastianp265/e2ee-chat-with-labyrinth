package edu.pw.safechat.labyrinth.internal.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Entity
@Getter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Table(indexes = {
        @Index(name = "inbox_thread_timestamp_index", columnList = "inbox_id, thread_id, timestamp")
})
public class ChatMessage {

    @Id
    private UUID messageId;

    @Column(nullable = false)
    private UUID threadId;

    @Column(nullable = false)
    private UUID inboxId;

    @Column(nullable = false)
    private Instant timestamp;

    @Column(nullable = false)
    private byte[] encryptedMessageData;

    @ManyToOne
    @JoinColumn(nullable = false)
    private Epoch epoch;

    @Column(nullable = false)
    private Long version;

}

