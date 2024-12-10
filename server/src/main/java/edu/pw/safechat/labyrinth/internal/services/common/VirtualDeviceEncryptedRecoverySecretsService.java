package edu.pw.safechat.labyrinth.internal.services.common;

import edu.pw.safechat.labyrinth.dtos.common.VirtualDeviceEncryptedRecoverySecretsDTO;
import edu.pw.safechat.labyrinth.internal.entities.Epoch;
import edu.pw.safechat.labyrinth.internal.entities.Labyrinth;
import edu.pw.safechat.labyrinth.internal.entities.VirtualDevice;
import edu.pw.safechat.labyrinth.internal.entities.VirtualDeviceEncryptedRecoverySecrets;
import edu.pw.safechat.labyrinth.internal.mappers.VirtualDeviceEncryptedRecoverySecretsMapper;
import edu.pw.safechat.labyrinth.internal.repositories.VirtualDeviceEncryptedRecoverySecretsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Example;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class VirtualDeviceEncryptedRecoverySecretsService {

    private final VirtualDeviceService virtualDeviceService;
    private final VirtualDeviceEncryptedRecoverySecretsRepository virtualDeviceEncryptedRecoverySecretsRepository;
    private final VirtualDeviceEncryptedRecoverySecretsMapper virtualDeviceEncryptedRecoverySecretsMapper;

    public VirtualDeviceEncryptedRecoverySecrets getVirtualDeviceEncryptedRecoverySecretsByIdAndLabyrinth(
            byte[] virtualDeviceId,
            Labyrinth labyrinth
    ) {
        VirtualDevice virtualDevice = virtualDeviceService.getVirtualDeviceByIdAndLabyrinth(virtualDeviceId, labyrinth);
        Example<VirtualDeviceEncryptedRecoverySecrets> example = Example.of(VirtualDeviceEncryptedRecoverySecrets.builder()
                .labyrinth(labyrinth)
                .virtualDevice(virtualDevice)
                .build()
        );

        return virtualDeviceEncryptedRecoverySecretsRepository.findOne(example)
                .orElseThrow();
    }

    public void createAndSave(
            VirtualDeviceEncryptedRecoverySecretsDTO virtualDeviceEncryptedRecoverySecretsDTO,
            Epoch epoch,
            VirtualDevice virtualDevice,
            Labyrinth labyrinth
    ) {
        virtualDeviceEncryptedRecoverySecretsRepository.save(
                virtualDeviceEncryptedRecoverySecretsMapper.toEntity(
                        virtualDeviceEncryptedRecoverySecretsDTO,
                        epoch,
                        virtualDevice,
                        labyrinth
                )
        );
    }


}
