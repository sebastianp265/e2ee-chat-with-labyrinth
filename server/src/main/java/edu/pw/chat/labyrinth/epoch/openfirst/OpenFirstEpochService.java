package edu.pw.chat.labyrinth.epoch.openfirst;

import edu.pw.chat.labyrinth.common.entities.ChatInbox;
import edu.pw.chat.labyrinth.common.mappers.*;
import edu.pw.chat.labyrinth.common.repositories.ChatInboxRepository;
import edu.pw.chat.labyrinth.common.repositories.DeviceRepository;
import edu.pw.chat.labyrinth.common.repositories.EpochRepository;
import edu.pw.chat.labyrinth.common.repositories.VirtualDeviceRepository;
import edu.pw.chat.user.services.ChatUserService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OpenFirstEpochService {

    private final EpochRepository epochRepository;
    private final DeviceRepository deviceRepository;
    private final VirtualDeviceRepository virtualDeviceRepository;
    private final ChatInboxRepository chatInboxRepository;

    private final ChatUserService chatUserService;

    private final EpochMapper epochMapper;
    private final DeviceMapper deviceMapper;
    private final VirtualDeviceMapper virtualDeviceMapper;
    private final DeviceEpochMembershipProofMapper deviceEpochMembershipProofMapper;
    private final VirtualDeviceEpochMembershipProofMapper virtualDeviceEpochMembershipProofMapper;

    private static final String FIRST_SEQUENCE_ID = "0";

    @Transactional
    public OpenFirstEpochResponseDTO openFirstEpoch(OpenFirstEpochBodyDTO openFirstEpochBodyDTO, String username) {
        UUID userID = chatUserService.getUserIDByUsername(username);
        if (chatInboxRepository.existsByUserID(userID)) {
            throw new AlreadyRegisteredToLabyrinthException();
        }
        var savedChatInbox = chatInboxRepository.save(
                ChatInbox.builder()
                        .userID(userID)
                        .build()
        );

        var savedDevice = deviceRepository.save(
                deviceMapper.toEntity(
                        openFirstEpochBodyDTO.devicePublicKeyBundleDTO()
                )
        );

        var savedVirtualDevice = virtualDeviceRepository.save(
                virtualDeviceMapper.toEntity(
                        openFirstEpochBodyDTO.virtualDeviceID(),
                        openFirstEpochBodyDTO.virtualDeviceEncryptedRecoverySecretsDTO(),
                        openFirstEpochBodyDTO.virtualDevicePublicKeyBundleDTO()
                )
        );

        var savedEpoch = epochRepository.save(
                epochMapper.toEntity(
                        savedChatInbox,
                        List.of(deviceEpochMembershipProofMapper.toEntity(
                                savedDevice,
                                openFirstEpochBodyDTO.firstEpochMembershipProof().epochDeviceMac()
                        )),
                        virtualDeviceEpochMembershipProofMapper.toEntity(
                                savedVirtualDevice,
                                openFirstEpochBodyDTO.firstEpochMembershipProof().epochVirtualDeviceMac()
                        ),
                        FIRST_SEQUENCE_ID
                )
        );

        return new OpenFirstEpochResponseDTO(savedDevice.getId(), savedEpoch.getId());
    }

}
