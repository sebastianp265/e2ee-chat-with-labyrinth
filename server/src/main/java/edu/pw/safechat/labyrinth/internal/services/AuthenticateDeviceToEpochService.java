package edu.pw.safechat.labyrinth.internal.services;

import edu.pw.safechat.labyrinth.dtos.AuthenticateDeviceToEpochDTO;
import edu.pw.safechat.labyrinth.internal.entities.Device;
import edu.pw.safechat.labyrinth.internal.entities.DeviceEpochMembershipProof;
import edu.pw.safechat.labyrinth.internal.entities.Epoch;
import edu.pw.safechat.labyrinth.internal.entities.Labyrinth;
import edu.pw.safechat.labyrinth.internal.repositories.DeviceEpochMembershipProofRepository;
import edu.pw.safechat.labyrinth.internal.services.common.DeviceService;
import edu.pw.safechat.labyrinth.internal.services.common.EpochService;
import edu.pw.safechat.labyrinth.internal.services.common.LabyrinthService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthenticateDeviceToEpochService {
    private final LabyrinthService labyrinthService;
    private final EpochService epochService;
    private final DeviceService deviceService;
    private final DeviceEpochMembershipProofRepository deviceEpochMembershipProofRepository;

    public void authenticateDeviceToEpoch(
            UUID epochId,
            UUID deviceId,
            AuthenticateDeviceToEpochDTO requestBodyDTO,
            UUID inboxId
    ) {
        Labyrinth labyrinth = labyrinthService.getByChatInboxId(inboxId);

        Epoch epoch = epochService.getEpochByIdAndLabyrinth(epochId, labyrinth);
        Device device = deviceService.getDeviceByIdAndLabyrinth(deviceId, labyrinth);
        deviceEpochMembershipProofRepository.save(
                DeviceEpochMembershipProof.builder()
                        .epoch(epoch)
                        .device(device)
                        .epochDeviceMac(requestBodyDTO.epochDeviceMac())
                        .build()
        );
    }
}
