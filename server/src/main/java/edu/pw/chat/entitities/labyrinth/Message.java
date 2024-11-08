package edu.pw.chat.entitities.labyrinth;

import edu.pw.chat.entitities.chat.ChatInbox;
import edu.pw.chat.entitities.chat.ChatThread;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Getter
@RequiredArgsConstructor
@Builder
@AllArgsConstructor
@Table(indexes = {
        @Index(name = "inbox_thread_timestamp_index", columnList = "inbox_id, thread_id, timestamp")
})
public class Message {

    @ManyToOne
    @JoinColumn(name = "inbox_id", nullable = false)
    private ChatInbox inbox;

    @ManyToOne
    @JoinColumn(name = "thread_id", nullable = false)
    private ChatThread thread;

    @Id
    @GeneratedValue
    private Long messageID;

    @Column(nullable = false)
    private Instant timestamp;

    @Column(nullable = false)
    private byte[] encryptedMessageData;

    @ManyToOne
    private Epoch epoch;

    private Long version;

}

