package edu.pw.chat.labyrinth.epoch.openfirst;

import edu.pw.chat.labyrinth.common.entities.ChatInbox;
import edu.pw.chat.labyrinth.common.entities.Device;
import edu.pw.chat.labyrinth.common.entities.Epoch;
import edu.pw.chat.labyrinth.common.entities.VirtualDevice;
import edu.pw.chat.labyrinth.common.mappers.*;
import edu.pw.chat.labyrinth.common.repositories.*;
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
    private final VirtualDeviceEncryptedRecoverySecretsRepository virtualDeviceEncryptedRecoverySecretsRepository;
    private final VirtualDeviceEncryptedRecoverySecretsMapper virtualDeviceEncryptedRecoverySecretsMapper;

    @Transactional
    public OpenFirstEpochResponseDTO openFirstEpoch(OpenFirstEpochBodyDTO openFirstEpochBodyDTO, String username) {
        UUID userID = chatUserService.getUserIDByUsername(username);
        if (chatInboxRepository.existsByUserID(userID)) {
            throw new AlreadyRegisteredToLabyrinthException();
        }
        ChatInbox savedChatInbox = chatInboxRepository.save(
                ChatInbox.builder()
                        .userID(userID)
                        .build()
        );

        Device savedDevice = deviceRepository.save(
                deviceMapper.toEntity(
                        openFirstEpochBodyDTO.devicePublicKeyBundle()
                )
        );

        VirtualDevice savedVirtualDevice = virtualDeviceRepository.save(
                virtualDeviceMapper.toEntity(
                        openFirstEpochBodyDTO.virtualDeviceID(),
                        savedChatInbox,
                        openFirstEpochBodyDTO.virtualDevicePublicKeyBundle()
                )
        );

        Epoch savedEpoch = epochRepository.save(
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

        virtualDeviceEncryptedRecoverySecretsRepository.save(
                virtualDeviceEncryptedRecoverySecretsMapper.toEntity(
                        openFirstEpochBodyDTO.virtualDeviceEncryptedRecoverySecrets(),
                        savedEpoch,
                        savedVirtualDevice
                )
        );

        return new OpenFirstEpochResponseDTO(savedDevice.getId(), savedEpoch.getId());
    }

}
