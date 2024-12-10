package edu.pw.safechat.labyrinth.internal.services;

import edu.pw.safechat.labyrinth.dtos.AuthenticateDeviceToEpochAndRegisterDeviceBodyDTO;
import edu.pw.safechat.labyrinth.dtos.AuthenticateDeviceToEpochAndRegisterDeviceResponseDTO;
import edu.pw.safechat.labyrinth.internal.entities.Device;
import edu.pw.safechat.labyrinth.internal.entities.Epoch;
import edu.pw.safechat.labyrinth.internal.entities.Labyrinth;
import edu.pw.safechat.labyrinth.internal.mappers.DeviceMapper;
import edu.pw.safechat.labyrinth.internal.repositories.DeviceEpochMembershipProofRepository;
import edu.pw.safechat.labyrinth.internal.repositories.DeviceRepository;
import edu.pw.safechat.labyrinth.internal.repositories.EpochRepository;
import edu.pw.safechat.labyrinth.internal.repositories.LabyrinthRepository;
import edu.pw.safechat.labyrinth.internal.services.common.DeviceEpochMembershipProofService;
import edu.pw.safechat.labyrinth.internal.services.common.DeviceService;
import edu.pw.safechat.labyrinth.internal.services.common.EpochService;
import edu.pw.safechat.labyrinth.internal.services.common.LabyrinthService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthenticateDeviceToEpochAndRegisterDeviceService {

    private final DeviceRepository deviceRepository;
    private final DeviceMapper deviceMapper;
    private final EpochRepository epochRepository;
    private final DeviceEpochMembershipProofRepository deviceEpochMembershipProofRepository;
    private final LabyrinthRepository labyrinthRepository;
    private final EpochService epochService;
    private final LabyrinthService labyrinthService;
    private final DeviceService deviceService;
    private final DeviceEpochMembershipProofService deviceEpochMembershipProofService;

    @Transactional
    public AuthenticateDeviceToEpochAndRegisterDeviceResponseDTO authenticateDeviceToEpochAndRegisterDevice(
            UUID epochId,
            AuthenticateDeviceToEpochAndRegisterDeviceBodyDTO requestBodyDTO,
            UUID inboxId
    ) {
        Labyrinth labyrinth = labyrinthService.getByChatInboxId(inboxId);
        Epoch epoch = epochService.getEpochByIdAndLabyrinth(epochId, labyrinth);

        Device device = deviceService.createAndSave(
                requestBodyDTO.devicePublicKeyBundle(),
                labyrinth
        );

        deviceEpochMembershipProofService.createAndSave(
                epoch,
                device,
                requestBodyDTO.epochDeviceMac()
        );

        return new AuthenticateDeviceToEpochAndRegisterDeviceResponseDTO(
                device.getId()
        );
    }
}
