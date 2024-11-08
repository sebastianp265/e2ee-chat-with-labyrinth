package edu.pw.chat.entitities.chat;

import edu.pw.chat.entitities.user.ChatUser;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.OneToOne;
import lombok.*;

@Entity
@Getter
@Builder
@RequiredArgsConstructor
@AllArgsConstructor
public class ChatInbox {

    @Id
    @GeneratedValue
    private Long id;

    @OneToOne
    private ChatUser owner;

}
