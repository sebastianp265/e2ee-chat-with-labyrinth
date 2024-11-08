package edu.pw.chat.entitities.user;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import lombok.*;

@Entity
@Getter
@RequiredArgsConstructor
@Builder
@AllArgsConstructor
public class ChatUser {

    @Id
    @GeneratedValue
    private Long id;

    @Column(nullable = false)
    private String username;

    @Column(nullable = false)
    private String visibleName;

}
