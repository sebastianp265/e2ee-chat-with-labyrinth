package edu.pw.chat.entitities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Entity
@NoArgsConstructor
public class Message {

    @Id
    @GeneratedValue
    Long id;

    String content;

    @ManyToOne
    ChatUser author;

    public Message(String content, ChatUser author) {
        this.content = content;
        this.author = author;
    }
}

