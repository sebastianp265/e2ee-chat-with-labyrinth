package edu.pw.safechat.labyrinth.services;

import edu.pw.safechat.labyrinth.dtos.chat.ChatMessageGetDTO;
import edu.pw.safechat.labyrinth.dtos.chat.ChatMessagePostDTO;
import edu.pw.safechat.labyrinth.internal.entities.ChatMessage;
import edu.pw.safechat.labyrinth.internal.repositories.ChatMessageRepository;
import edu.pw.safechat.labyrinth.internal.repositories.EpochRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Example;
import org.springframework.data.domain.Pageable;
import org.springframework.data.util.Pair;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class LabyrinthMessageStorageService {

    private final ChatMessageRepository chatMessageRepository;
    private final EpochRepository epochRepository;

    // TODO: remove transactional
    @Transactional
    public List<ChatMessageGetDTO> getMessagesByThreadId(@NonNull UUID inboxId, @NonNull UUID threadId, Pageable pageable) {
        ChatMessage probe = ChatMessage.builder()
                .inboxId(inboxId)
                .threadId(threadId)
                .build();

        Example<ChatMessage> example = Example.of(probe);

        return chatMessageRepository.findAll(example, pageable)
                .map(m -> new ChatMessageGetDTO(
                        m.getMessageId(),
                        m.getEpoch().getSequenceId(),
                        m.getEncryptedMessageData(),
                        m.getTimestamp().toEpochMilli()
                ))
                .toList();
    }

    // TODO: Handle pagination
    public List<Pair<UUID, ChatMessageGetDTO>> getThreadIdLatestMessagePairs(@NonNull UUID inboxId) {
        return chatMessageRepository.findLatestMessagePerThreadByInboxId(inboxId)
                .stream()
                .map(m -> Pair.of(
                        m.getThreadId(),
                        new ChatMessageGetDTO(
                                m.getMessageId(),
                                m.getEpoch().getSequenceId(),
                                m.getEncryptedMessageData(),
                                m.getTimestamp().toEpochMilli()
                        )
                ))
                .toList();
    }

    // TODO: Remove transactional
    @Transactional
    public void storeMessages(
            @NonNull UUID inboxId,
            @NonNull UUID threadId,
            @NonNull List<ChatMessagePostDTO> messages
    ) {
        chatMessageRepository.saveAll(
                messages.stream()
                        .map(m -> ChatMessage.builder()
                                .messageId(m.id())
                                .threadId(threadId)
                                .inboxId(inboxId)
                                .timestamp(Instant.ofEpochMilli(m.timestamp()))
                                .encryptedMessageData(m.encryptedMessageData())
                                .epoch(
                                        epochRepository.findById(m.epochId())
                                                .orElseThrow()
                                )
                                .version(0L)
                                .build()
                        )
                        .toList()
        );
    }

}
