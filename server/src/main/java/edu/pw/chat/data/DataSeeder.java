package edu.pw.chat.data;

import edu.pw.chat.entitities.ChatInbox;
import edu.pw.chat.entitities.ChatThread;
import edu.pw.chat.entitities.ChatUser;
import edu.pw.chat.entitities.Message;
import edu.pw.chat.repository.ChatInboxRepository;
import edu.pw.chat.repository.ChatThreadRepository;
import edu.pw.chat.repository.ChatUserRepository;
import edu.pw.chat.repository.MessageRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.Set;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements ApplicationRunner {

    private final MessageRepository messageRepository;
    private final ChatUserRepository chatUserRepository;
    private final ChatThreadRepository chatThreadRepository;
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


        ChatInbox sebaInbox = chatInboxRepository.save(
                ChatInbox.builder()
                        .owner(seba)
                        .build()
        );
        ChatInbox krzysioInbox = chatInboxRepository.save(
                ChatInbox.builder()
                        .owner(krzysio)
                        .build()
        );
        ChatInbox arekInbox = chatInboxRepository.save(
                ChatInbox.builder()
                        .owner(arek)
                        .build()
        );

        ChatThread chatThreadBetweenSebaAndKrzysio = chatThreadRepository.save(ChatThread.builder()
                .subscribedInboxes(Set.of(sebaInbox, krzysioInbox))
                .build());
        sendMessage(seba, chatThreadBetweenSebaAndKrzysio, "Hi!");
        sendMessage(krzysio, chatThreadBetweenSebaAndKrzysio, "Hello");
        sendMessage(seba, chatThreadBetweenSebaAndKrzysio, "Are you up?");
        sendMessage(seba, chatThreadBetweenSebaAndKrzysio, "Wanna go to my friend's party?");
        sendMessage(krzysio, chatThreadBetweenSebaAndKrzysio, "Sure");

        ChatThread chatThreadBetweenSebaAndArek = chatThreadRepository.save(
                ChatThread.builder()
                        .subscribedInboxes(Set.of(sebaInbox, arekInbox))
                        .build()
        );
        sendMessage(arek, chatThreadBetweenSebaAndArek, "I will arrive at 6pm");
        sendMessage(seba, chatThreadBetweenSebaAndArek, "Okay, see you later then");
        sendMessage(arek, chatThreadBetweenSebaAndArek, "Have you brought the present?");

        ChatThread chatThreadBetweenArekAndKrzysio = chatThreadRepository.save(
                ChatThread.builder()
                        .subscribedInboxes(Set.of(arekInbox, krzysioInbox))
                        .build()
        );
        sendMessage(arek, chatThreadBetweenArekAndKrzysio, "Hey, how you doing");
        sendMessage(krzysio, chatThreadBetweenArekAndKrzysio, "Pretty well, watching Game Of Thrones at the moment");

    }

    private int sentMessages = 0;

    private void sendMessage(ChatUser author, ChatThread destinationThread, String messageData) {
        for (ChatInbox chatInbox : destinationThread.getSubscribedInboxes()) {
            Message messageToSave = Message.builder()
                    .thread(destinationThread)
                    .inbox(chatInbox)
                    .author(author)
                    .timestamp(Instant.now().plusSeconds(sentMessages))
                    .messageData(messageData)
                    .build();
            sentMessages++;
            messageRepository.save(messageToSave);
        }
    }

}
