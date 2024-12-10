package edu.pw.safechat.labyrinth.internal.services;

import edu.pw.safechat.labyrinth.dtos.OpenFirstEpochBodyDTO;
import edu.pw.safechat.labyrinth.dtos.OpenFirstEpochResponseDTO;
import edu.pw.safechat.labyrinth.internal.entities.Device;
import edu.pw.safechat.labyrinth.internal.entities.Epoch;
import edu.pw.safechat.labyrinth.internal.entities.Labyrinth;
import edu.pw.safechat.labyrinth.internal.entities.VirtualDevice;
import edu.pw.safechat.labyrinth.internal.services.common.*;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OpenFirstEpochService {

    private static final String FIRST_SEQUENCE_ID = "0";

    private final DeviceService deviceService;
    private final EpochService epochService;
    private final LabyrinthService labyrinthService;
    private final VirtualDeviceEncryptedRecoverySecretsService virtualDeviceEncryptedRecoverySecretsService;
    private final VirtualDeviceService virtualDeviceService;
    private final DeviceEpochMembershipProofService deviceEpochMembershipProofService;
    private final VirtualDeviceEpochMembershipProofService virtualDeviceEpochMembershipProofService;

    @Transactional
    public OpenFirstEpochResponseDTO openFirstEpoch(
            OpenFirstEpochBodyDTO openFirstEpochBodyDTO,
            UUID inboxId
    ) {
        Labyrinth labyrinth = labyrinthService.createAndSave(inboxId);

        Epoch epoch = epochService.createAndSave(
                labyrinth,
                FIRST_SEQUENCE_ID
        );

        Device device = deviceService.createAndSave(
                openFirstEpochBodyDTO.devicePublicKeyBundle(),
                labyrinth
        );

        deviceEpochMembershipProofService.createAndSave(
                epoch,
                device,
                openFirstEpochBodyDTO.firstEpochMembershipProof().epochDeviceMac()
        );

        VirtualDevice virtualDevice = virtualDeviceService.createAndSave(
                openFirstEpochBodyDTO.virtualDeviceId(),
                openFirstEpochBodyDTO.virtualDevicePublicKeyBundle(),
                labyrinth
        );

        virtualDeviceEpochMembershipProofService.createAndSave(
                epoch,
                openFirstEpochBodyDTO.firstEpochMembershipProof().epochVirtualDeviceMac()
        );

        virtualDeviceEncryptedRecoverySecretsService.createAndSave(
                openFirstEpochBodyDTO.virtualDeviceEncryptedRecoverySecrets(),
                epoch,
                virtualDevice,
                labyrinth
        );

        return new OpenFirstEpochResponseDTO(device.getId(), epoch.getId());
    }

}