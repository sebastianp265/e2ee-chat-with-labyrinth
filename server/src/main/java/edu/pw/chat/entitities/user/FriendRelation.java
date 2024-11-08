package edu.pw.chat.entitities.user;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@RequiredArgsConstructor
@Builder
@AllArgsConstructor
public class FriendRelation {

    @Id
    @GeneratedValue
    private Long id;

    @ManyToOne
    private ChatUser chatUser;

    @ManyToOne
    private ChatUser chatUserFriend;

    public enum Status {
        PENDING, ACCEPTED, DECLINED
    }

    @Enumerated(EnumType.STRING)
    private Status status;

}
