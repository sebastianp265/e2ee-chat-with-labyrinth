package edu.pw.chat.entitities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.Instant;

@Data
@Entity
@NoArgsConstructor
@IdClass(Message.MessageId.class)
public class Message {

    @Id
    private Long conversationId;

    @Id
    @GeneratedValue
    private Long id;

    private String content;

    @ManyToOne
    private ChatUser author;

    private Instant sentAt;

    public Message(String content, ChatUser author, Instant sentAt) {
        this.content = content;
        this.author = author;
        this.sentAt = sentAt;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class MessageId implements Serializable {
        private Long conversationId;
        private Long id;
    }

}

