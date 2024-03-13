package edu.pw.chat.entitities;

import jakarta.persistence.*;
import lombok.Data;

import java.util.List;
import java.util.Set;

@Data
@Entity
public class Conversation {

    @Id
    @GeneratedValue
    Long conversationId;

    @ManyToMany
    Set<UserInfo> userInfos;

    @OneToMany
    List<Message> messages;

    String conversationName;

}
