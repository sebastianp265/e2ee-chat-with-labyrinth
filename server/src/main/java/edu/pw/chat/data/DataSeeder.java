package edu.pw.chat.data;

import edu.pw.chat.entitities.ChatUser;
import edu.pw.chat.entitities.Conversation;
import edu.pw.chat.entitities.Message;
import edu.pw.chat.repository.ConversationRepository;
import edu.pw.chat.repository.MessageRepository;
import edu.pw.chat.repository.UserInfoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements ApplicationRunner {

    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;
    private final UserInfoRepository userInfoRepository;

    @Override
    public void run(ApplicationArguments args) {
        seed();
    }

    public void seed() {
        log.debug("Running data seeder");

        List<ChatUser> users = prepareUsers();
        prepareConversations(users);
    }

    private List<ChatUser> prepareUsers() {
        ChatUser chatUser1 = new ChatUser();
        chatUser1.setName("seba");

        ChatUser chatUser2 = new ChatUser();
        chatUser2.setName("krzysio");

        ChatUser chatUser3 = new ChatUser();
        chatUser3.setName("arek");

        return List.of(
                userInfoRepository.save(chatUser1),
                userInfoRepository.save(chatUser2),
                userInfoRepository.save(chatUser3)
        );
    }

    void prepareConversations(List<ChatUser> users) {
        ChatUser seba = users.get(0);
        ChatUser krzysio = users.get(1);
        ChatUser arek = users.get(2);
        Instant now = Instant.now();

        Conversation conversationBetweenSebaAndKrzysio = new Conversation();
        conversationBetweenSebaAndKrzysio.setMembers(
                new HashSet<>(List.of(seba, krzysio))
        );
        conversationBetweenSebaAndKrzysio.setMessages(saveMessagesToRepository(1L,
                new Message("Hi!", seba, now.plusSeconds(1)),
                new Message("Hello", krzysio, now.plusSeconds(2)),
                new Message("Are you up?", seba, now.plusSeconds(3)),
                new Message("Wanna go to my friend's party?", seba, now.plusSeconds(4)),
                new Message("Sure", krzysio, now.plusSeconds(5))
        ));

        Conversation conversationBetweenSebaAndArek = new Conversation();
        conversationBetweenSebaAndArek.setMembers(
                new HashSet<>(List.of(seba, arek))
        );
        conversationBetweenSebaAndArek.setMessages(saveMessagesToRepository(2L,
                new Message("I will arrive at 6pm", arek, now.plusSeconds(6)),
                new Message("Okay, see you later then", seba, now.plusSeconds(7)),
                new Message("Have you brought the present?", arek, now.plusSeconds(8))
        ));


        Conversation conversationBetweenArekAndKrzysio = new Conversation();
        conversationBetweenArekAndKrzysio.setMembers(
                new HashSet<>(List.of(arek, krzysio))
        );
        conversationBetweenArekAndKrzysio.setMessages(saveMessagesToRepository(3L,
                new Message("Hey, how you doing", arek, now.plusSeconds(9)),
                new Message("Pretty well, watching Game Of Thrones at the moment", krzysio, now.plusSeconds(10))
        ));

        conversationRepository.saveAll(List.of(
                conversationBetweenSebaAndKrzysio,
                conversationBetweenSebaAndArek,
                conversationBetweenArekAndKrzysio
        ));
    }

    private List<Message> saveMessagesToRepository(Long conversationId, Message... messages) {
        List<Message> returnedMessages = new ArrayList<>();

        for(Message message : messages) {
            message.setConversationId(conversationId);
            returnedMessages.add(messageRepository.save(message));
        }

        return returnedMessages;
    }

}
