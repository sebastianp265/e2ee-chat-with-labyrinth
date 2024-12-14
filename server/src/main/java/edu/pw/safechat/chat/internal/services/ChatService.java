package edu.pw.safechat.chat.internal.services;

import edu.pw.safechat.chat.dtos.ChatThreadPreviewDTO;
import edu.pw.safechat.chat.internal.entities.ChatThreadMember;
import edu.pw.safechat.chat.internal.repositories.ChatThreadRepository;
import edu.pw.safechat.labyrinth.dtos.chat.ChatMessageGetDTO;
import edu.pw.safechat.labyrinth.services.LabyrinthMessageStorageService;
import edu.pw.safechat.user.internal.services.ChatUserService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.util.Pair;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final ChatUserService chatUserService;
    private final LabyrinthMessageStorageService labyrinthMessageStorageService;
    private final ChatThreadRepository chatThreadRepository;

    // TODO: Replace transactional
    @Transactional
    public List<ChatThreadPreviewDTO> getChatThreadPreviews(
            UUID inboxId
    ) {
        List<Pair<UUID, ChatMessageGetDTO>> threadIdMessagePairs = labyrinthMessageStorageService.getThreadIdLatestMessagePairs(inboxId);

        return threadIdMessagePairs
                .stream()
                .map(threadIdMessagePair -> {
                    var threadId = threadIdMessagePair.getFirst();
                    var message = threadIdMessagePair.getSecond();

                    var thread = chatThreadRepository.findById(threadId)
                            .orElseThrow();
                    return new ChatThreadPreviewDTO(
                            threadId,
                            thread.getName(),
                            message,
                            thread.getMembers()
                                    .stream()
                                    .collect(Collectors.toMap(
                                            ChatThreadMember::getUserId,
                                            m -> {
                                                String name = m.getVisibleName();
                                                if (name == null) {
                                                    name = chatUserService.getVisibleNameOfUserWithId(m.getUserId());
                                                }
                                                return name;
                                            }
                                    ))
                    );
                })
                .toList();
    }
}
