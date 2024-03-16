package edu.pw.chat.entitities;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import lombok.Data;

@Data
@Entity
public class ChatUser {

    @GeneratedValue
    @Id
    Long id;

    String name;

}
