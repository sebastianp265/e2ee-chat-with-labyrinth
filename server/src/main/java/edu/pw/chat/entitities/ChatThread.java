package edu.pw.chat.entitities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

@Data
@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatThread {

    @Id
    @GeneratedValue
    Long id;

    // if the conversation is not a group one (more than 2 members) then *name=null* ,
    // else *name=receiver name*
    String name;

//    @ManyToMany
//    Set<ChatUser> members;

    @ManyToMany
    Set<ChatInbox> subscribedInboxes;

}
