package edu.pw.chat.entitities;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import lombok.Data;

@Data
@Entity
public class Message {

    @Id
    @GeneratedValue
    Long id;

    String content;

    Long authorId;

}

