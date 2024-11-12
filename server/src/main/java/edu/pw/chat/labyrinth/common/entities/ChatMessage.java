package edu.pw.chat.labyrinth.common.entities;

import jakarta.persistence.*;
import lombok.*;

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

    @ManyToOne
    @JoinColumn(name = "inbox_id", nullable = false)
    private ChatInbox inbox;

    @ManyToOne
    @JoinColumn(name = "thread_id", nullable = false)
    private ChatThread thread;

    @Id
    @GeneratedValue
    private UUID messageID;

    @Column(name = "timestamp", nullable = false)
    private Instant timestamp;

    @Column(nullable = false)
    private byte[] encryptedMessageData;

    @ManyToOne
    @JoinColumn(nullable = false)
    private Epoch epoch;

    @Column(nullable = false)
    private Long version;

}

