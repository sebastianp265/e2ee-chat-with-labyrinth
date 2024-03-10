package edu.pw.chat.data;

import edu.pw.chat.entitities.Conversation;
import edu.pw.chat.entitities.Message;
import edu.pw.chat.entitities.UserInfo;
import edu.pw.chat.repository.ConversationRepository;
import edu.pw.chat.repository.MessageRepository;
import edu.pw.chat.repository.UserInfoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.event.ContextRefreshedEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import java.util.*;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements ApplicationRunner {

    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;
    private final UserInfoRepository userInfoRepository;

    @Override
    public void run(ApplicationArguments args) throws Exception {
        seed();
    }

    public void seed() {
        log.debug("Running data seeder");
        Conversation conversation = new Conversation();

        List<UserInfo> users = prepareUsers();
        List<Message> messages = prepareMessages(users.getFirst().getId(), users.getLast().getId());

        conversation.setUserInfos(new HashSet<>(users));
        conversation.setMessages(messages);

        conversationRepository.save(conversation);
    }

    private List<UserInfo> prepareUsers() {
        UserInfo userInfo1 = new UserInfo();
        userInfo1.setName("Christopher Bear");

        UserInfo userInfo2 = new UserInfo();
        userInfo2.setName("Jack Sparrow");

        return List.of(
                userInfoRepository.save(userInfo1),
                userInfoRepository.save(userInfo2)
        );
    }

    private List<Message> prepareMessages(Long user1Id, Long user2Id) {
        Message message1 = new Message();
        message1.setAuthorId(user1Id);
        message1.setContent("Hello!");

        Message message2 = new Message();
        message2.setAuthorId(user2Id);
        message2.setContent("Hi :)");

        Message message3 = new Message();
        message3.setAuthorId(user1Id);
        message3.setContent("How are you doing?");

        return List.of(
                messageRepository.save(message1),
                messageRepository.save(message2),
                messageRepository.save(message3)
        );
    }


}
