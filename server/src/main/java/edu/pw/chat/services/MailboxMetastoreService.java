package edu.pw.chat.services;

import edu.pw.chat.dtos.labyrinth.EpochCreateDTO;
import edu.pw.chat.dtos.labyrinth.EpochGetDTO;
import edu.pw.chat.dtos.labyrinth.KeyBundleDTO;
import edu.pw.chat.entitities.ChatUser;
import edu.pw.chat.entitities.labyrinth.Epoch;
import edu.pw.chat.entitities.labyrinth.KeyBundle;
import edu.pw.chat.mappers.EpochMapper;
import edu.pw.chat.mappers.KeyBundleMapper;
import edu.pw.chat.repository.ChatUserRepository;
import edu.pw.chat.repository.labyrinth.EpochRepository;
import edu.pw.chat.repository.labyrinth.KeyBundleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MailboxMetastoreService {

    private final KeyBundleRepository keyBundleRepository;
    private final EpochRepository epochRepository;
    private final ChatUserRepository chatUserRepository;
    private final KeyBundleMapper keyBundleMapper;
    private final EpochMapper epochMapper;

    public Long createEpoch(String username, EpochCreateDTO epochCreateDTO) {
        ChatUser chatUser = chatUserRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        KeyBundle keyBundle = keyBundleMapper.toKeyBundle(epochCreateDTO.getKeyBundle(), chatUser);
        KeyBundle savedKeyBundle = keyBundleRepository.save(keyBundle);

        Epoch epoch = epochMapper.toEpoch(epochCreateDTO.getEpochRootKey(), savedKeyBundle);
        Epoch savedEpoch = epochRepository.save(epoch);

        return savedEpoch.getId();
    }

    public EpochGetDTO getEpoch(String username, Long epochId) {
        Epoch epoch = epochRepository.findById(epochId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Epoch not found"));
        List<KeyBundle> keyBundlesInEpoch = epoch.getKeyBundles();
        if (keyBundlesInEpoch.stream()
                .noneMatch(
                        keyBundle ->
                                keyBundle.getChatUser().getUsername().equals(username)
                )
        ) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not a member of this epoch");
        }

        return epochMapper.toEpochGetDTO(epoch);
    }

    // TODO: Send epoch root key over secure channel
    public String joinEpoch(String username, Long epochId, KeyBundleDTO keyBundleDTO) {
        // TODO: Check if user can join epoch
        Epoch epoch = epochRepository.findById(epochId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Epoch not found"));
        ChatUser chatUser = chatUserRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        epoch.getKeyBundles().add(keyBundleMapper.toKeyBundle(keyBundleDTO, chatUser));

        epochRepository.save(epoch);

        return epoch.getEpochRootKey();
    }
}
