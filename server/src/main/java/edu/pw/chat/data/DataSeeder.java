package edu.pw.chat.data;

import edu.pw.chat.labyrinth.common.entities.ChatInbox;
import edu.pw.chat.user.entities.ChatUser;
import edu.pw.chat.user.entities.FriendRelation;
import edu.pw.chat.labyrinth.common.repositories.ChatInboxRepository;
import edu.pw.chat.user.repositories.ChatUserRepository;
import edu.pw.chat.user.repositories.FriendRelationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements ApplicationRunner {

    private final ChatUserRepository chatUserRepository;
    private final FriendRelationRepository friendRelationRepository;
    private final ChatInboxRepository chatInboxRepository;

    @Override
    public void run(ApplicationArguments args) {
        seed();
    }

    public void seed() {
        log.debug("Running data seeder");

        ChatUser seba = chatUserRepository.save(
                ChatUser.builder()
                        .username("seba")
                        .visibleName("Sebastian")
                        .build()
        );
        ChatUser krzysio = chatUserRepository.save(
                ChatUser.builder()
                        .username("krzysio")
                        .visibleName("Krzysztof")
                        .build()
        );
        ChatUser arek = chatUserRepository.save(
                ChatUser.builder()
                        .username("arek")
                        .visibleName("Arkadiusz")
                        .build()
        );

        chatInboxRepository.save(
                ChatInbox.builder()
                        .userID(seba.getId())
                        .build()
        );
        chatInboxRepository.save(
                ChatInbox.builder()
                        .userID(krzysio.getId())
                        .build()
        );
        chatInboxRepository.save(
                ChatInbox.builder()
                        .userID(arek.getId())
                        .build()
        );

        friendRelationRepository.saveAll(
                List.of(
                        FriendRelation
                                .builder()
                                .chatUser(seba)
                                .chatUserFriend(krzysio)
                                .status(FriendRelation.Status.ACCEPTED)
                                .build(),
                        FriendRelation
                                .builder()
                                .chatUser(krzysio)
                                .chatUserFriend(seba)
                                .status(FriendRelation.Status.ACCEPTED)
                                .build(),

                        FriendRelation
                                .builder()
                                .chatUser(seba)
                                .chatUserFriend(arek)
                                .status(FriendRelation.Status.ACCEPTED)
                                .build(),
                        FriendRelation
                                .builder()
                                .chatUser(arek)
                                .chatUserFriend(seba)
                                .status(FriendRelation.Status.ACCEPTED)
                                .build(),

                        FriendRelation
                                .builder()
                                .chatUser(krzysio)
                                .chatUserFriend(arek)
                                .status(FriendRelation.Status.PENDING)
                                .build(),
                        FriendRelation
                                .builder()
                                .chatUser(arek)
                                .chatUserFriend(krzysio)
                                .status(FriendRelation.Status.PENDING)
                                .build()
                )
        );
    }

}
