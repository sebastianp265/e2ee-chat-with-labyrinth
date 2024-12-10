package edu.pw.safechat.user.internal.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Entity
@Getter
@RequiredArgsConstructor
@Builder
@AllArgsConstructor
public class FriendRelation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
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
