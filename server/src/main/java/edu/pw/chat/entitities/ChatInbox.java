package edu.pw.chat.entitities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Entity
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ChatInbox {

    @GeneratedValue
    @Id
    Long id;

    @OneToOne
    private ChatUser owner;

}
