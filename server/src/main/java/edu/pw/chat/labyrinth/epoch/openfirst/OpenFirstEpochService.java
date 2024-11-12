package edu.pw.chat.labyrinth.epoch.openfirst;

import edu.pw.chat.labyrinth.common.mappers.*;
import edu.pw.chat.labyrinth.common.repositories.*;
import edu.pw.chat.labyrinth.common.services.ChatInboxService;
import edu.pw.chat.user.services.ChatUserService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OpenFirstEpochService {

    private final EpochRepository epochRepository;
    private final DeviceRepository deviceRepository;
    private final VirtualDeviceRepository virtualDeviceRepository;
    private final DeviceEpochMembershipProofRepository deviceEpochMembershipProofRepository;
    private final VirtualDeviceEpochMembershipProofRepository virtualDeviceEpochMembershipProofRepository;
    private final VirtualDeviceEncryptedRecoverySecretsRepository virtualDeviceEncryptedRecoverySecretsRepository;

    private final ChatInboxService chatInboxService;
    private final ChatUserService chatUserService;

    private final EpochMapper epochMapper;
    private final DeviceMapper deviceMapper;
    private final VirtualDeviceMapper virtualDeviceMapper;
    private final DeviceEpochMembershipProofMapper deviceEpochMembershipProofMapper;
    private final VirtualDeviceEpochMembershipProofMapper virtualDeviceEpochMembershipProofMapper;
    private final VirtualDeviceEncryptedRecoverySecretsMapper virtualDeviceEncryptedRecoverySecretsMapper;

    private static final String FIRST_SEQUENCE_ID = "0";

    @Transactional
    public OpenFirstEpochResponseDTO openFirstEpoch(OpenFirstEpochBodyDTO openFirstEpochBodyDTO, String username) {
        UUID userID = chatUserService.getUserIDByUsername(username);
        if (chatInboxService.existsByUserID(userID)) {
            throw new AlreadyRegisteredToLabyrinthException();
        }
        var savedEpoch = epochRepository.save(
                epochMapper.toEntity(
                        FIRST_SEQUENCE_ID
                )
        );

        var savedDevice = deviceRepository.save(deviceMapper.toEntity(
                openFirstEpochBodyDTO.devicePublicKeyBundleDTO()
        ));
        deviceEpochMembershipProofRepository.save(
                deviceEpochMembershipProofMapper.toEntity(
                        savedEpoch,
                        savedDevice,
                        openFirstEpochBodyDTO.firstEpochMembershipProof().epochThisDeviceMac()
                )
        );

        var savedVirtualDeviceEncryptedRecoverySecrets = virtualDeviceEncryptedRecoverySecretsRepository.save(
                virtualDeviceEncryptedRecoverySecretsMapper.toEntity(openFirstEpochBodyDTO.virtualDeviceEncryptedRecoverySecretsDTO())
        );
        var savedVirtualDevice = virtualDeviceRepository.save(
                virtualDeviceMapper.toEntity(
                        openFirstEpochBodyDTO.virtualDeviceID(),
                        savedVirtualDeviceEncryptedRecoverySecrets,
                        openFirstEpochBodyDTO.virtualDevicePublicKeyBundleDTO()
                )
        );
        virtualDeviceEpochMembershipProofRepository.save(
                virtualDeviceEpochMembershipProofMapper.toEntity(
                        savedEpoch,
                        savedVirtualDevice,
                        openFirstEpochBodyDTO.firstEpochMembershipProof().epochVirtualDeviceMac()
                )
        );

        return new OpenFirstEpochResponseDTO(savedDevice.getId(), savedEpoch.getId());
    }

}
