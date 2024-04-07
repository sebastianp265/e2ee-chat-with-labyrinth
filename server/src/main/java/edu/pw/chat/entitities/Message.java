package edu.pw.chat.entitities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.Instant;

@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(indexes = {
        @Index(name="inbox_thread_timestamp_index", columnList = "inbox_id, thread_id, timestamp")
})
public class Message {

    @ManyToOne
    @JoinColumn(name = "inbox_id", nullable = false)
    private ChatInbox inbox;

    @ManyToOne
    @JoinColumn(name = "thread_id", nullable = false)
    private ChatThread thread;

    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Id
    private Long messageId;

    @ManyToOne
    @JoinColumn(name = "author_id", nullable = false)
    private ChatUser author;

    @Column(nullable = false)
    private Instant timestamp;

    @Column(nullable = false)
    private String messageData;

}

