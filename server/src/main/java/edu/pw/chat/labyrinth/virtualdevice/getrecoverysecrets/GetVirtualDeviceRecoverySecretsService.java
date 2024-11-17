package edu.pw.chat.labyrinth.virtualdevice.getrecoverysecrets;

import edu.pw.chat.labyrinth.common.entities.VirtualDeviceEncryptedRecoverySecrets;
import edu.pw.chat.labyrinth.common.repositories.VirtualDeviceEncryptedRecoverySecretsRepository;
import edu.pw.chat.user.services.ChatUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class GetVirtualDeviceRecoverySecretsService {

    private final ChatUserService chatUserService;
    private final GetVirtualDeviceRecoverySecretsResponseMapper getVirtualDeviceRecoverySecretsResponseMapper;
    private final VirtualDeviceEncryptedRecoverySecretsRepository virtualDeviceEncryptedRecoverySecretsRepository;

    public GetVirtualDeviceRecoverySecretsResponseDTO getRecoverySecrets(
            String virtualDeviceID,
            String username
    ) {
        UUID userID = chatUserService.getUserIDByUsername(username);
        VirtualDeviceEncryptedRecoverySecrets virtualDeviceEncryptedRecoverySecrets =
                virtualDeviceEncryptedRecoverySecretsRepository.findByVirtualDevice_IdAndVirtualDevice_ChatInbox_UserID(
                        virtualDeviceID,
                        userID
                ).orElseThrow(VirtualDeviceAccessDeniedException::new);

        return getVirtualDeviceRecoverySecretsResponseMapper.toDTO(
                virtualDeviceEncryptedRecoverySecrets
        );

    }
}
