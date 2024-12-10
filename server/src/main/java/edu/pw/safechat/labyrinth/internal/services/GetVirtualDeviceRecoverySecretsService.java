package edu.pw.safechat.labyrinth.internal.services;

import edu.pw.safechat.labyrinth.dtos.GetVirtualDeviceRecoverySecretsResponseDTO;
import edu.pw.safechat.labyrinth.internal.entities.Labyrinth;
import edu.pw.safechat.labyrinth.internal.mappers.GetVirtualDeviceRecoverySecretsResponseMapper;
import edu.pw.safechat.labyrinth.internal.services.common.LabyrinthService;
import edu.pw.safechat.labyrinth.internal.services.common.VirtualDeviceEncryptedRecoverySecretsService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class GetVirtualDeviceRecoverySecretsService {

    private final GetVirtualDeviceRecoverySecretsResponseMapper getVirtualDeviceRecoverySecretsResponseMapper;
    private final LabyrinthService labyrinthService;
    private final VirtualDeviceEncryptedRecoverySecretsService virtualDeviceEncryptedRecoverySecretsService;

    public GetVirtualDeviceRecoverySecretsResponseDTO getRecoverySecrets(
            byte[] virtualDeviceId,
            UUID inboxId
    ) {
        Labyrinth labyrinth = labyrinthService.getByChatInboxId(inboxId);

        return getVirtualDeviceRecoverySecretsResponseMapper.toDTO(
                virtualDeviceEncryptedRecoverySecretsService.getVirtualDeviceEncryptedRecoverySecretsByIdAndLabyrinth(
                        virtualDeviceId,
                        labyrinth
                )
        );
    }
}
