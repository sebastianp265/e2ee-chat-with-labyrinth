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

        Conversation conversationBetweenSebaAndKrzysio = new Conversation();
        conversationBetweenSebaAndKrzysio.setMembers(
                new HashSet<>(List.of(seba, krzysio))
        );
        conversationBetweenSebaAndKrzysio.setMessages(saveMessagesToRepository(
                new Message("Hi!", seba),
                new Message("Hello", krzysio),
                new Message("Are you up?", seba),
                new Message("Wanna go to my friend's party?", seba),
                new Message("Sure", krzysio)
        ));

        Conversation conversationBetweenSebaAndArek = new Conversation();
        conversationBetweenSebaAndArek.setMembers(
                new HashSet<>(List.of(seba, arek))
        );
        conversationBetweenSebaAndArek.setMessages(saveMessagesToRepository(
                new Message("I will arrive at 6pm", arek),
                new Message("Okay, see you later then", seba),
                new Message("Have you brought the present?", arek)
        ));


        Conversation conversationBetweenArekAndKrzysio = new Conversation();
        conversationBetweenArekAndKrzysio.setMembers(
                new HashSet<>(List.of(arek, krzysio))
        );
        conversationBetweenArekAndKrzysio.setMessages(saveMessagesToRepository(
                new Message("Hey, how you doing", arek),
                new Message("Pretty well, watching Game Of Thrones at the moment", krzysio)
        ));

        conversationRepository.saveAll(List.of(
                conversationBetweenSebaAndKrzysio,
                conversationBetweenSebaAndArek,
                conversationBetweenArekAndKrzysio
        ));
    }

    private List<Message> saveMessagesToRepository(Message... messages) {
        List<Message> returnedMessages = new ArrayList<>();

        for(Message message : messages) {
            returnedMessages.add(messageRepository.save(message));
        }

        return returnedMessages;
    }

}
