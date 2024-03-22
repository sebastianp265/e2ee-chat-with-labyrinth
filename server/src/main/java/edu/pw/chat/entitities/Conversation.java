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
    Long id;

    @ManyToMany
    Set<ChatUser> members;

    @OneToMany
    List<Message> messages;

    // if the conversation is not a group one (more than 2 members) then *name=null* ,
    // else *name=receiver name*
    String name;

}
