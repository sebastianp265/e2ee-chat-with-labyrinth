package edu.pw.safechat.labyrinth.internal.services;

import edu.pw.safechat.labyrinth.dtos.GetNewerEpochJoinDataResponseDTO;
import edu.pw.safechat.labyrinth.dtos.GetNewestEpochSequenceIdResponseDTO;
import edu.pw.safechat.labyrinth.internal.entities.*;
import edu.pw.safechat.labyrinth.internal.mappers.DeviceMapper;
import edu.pw.safechat.labyrinth.internal.repositories.EncryptedEpochEntropyForDeviceRepository;
import edu.pw.safechat.labyrinth.internal.services.common.DeviceService;
import edu.pw.safechat.labyrinth.internal.services.common.EpochService;
import edu.pw.safechat.labyrinth.internal.services.common.LabyrinthService;
import edu.pw.safechat.labyrinth.internal.services.common.VirtualDeviceService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Example;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class JoinEpochService {

    private final LabyrinthService labyrinthService;
    private final EpochService epochService;
    private final DeviceService deviceService;
    private final EncryptedEpochEntropyForDeviceRepository encryptedEpochEntropyForDeviceRepository;
    private final DeviceMapper deviceMapper;
    private final VirtualDeviceService virtualDeviceService;
    private final EncryptedEpochEntropyForVirtualDeviceRepository encryptedEpochEntropyForVirtualDeviceRepository;

    public GetNewestEpochSequenceIdResponseDTO getNewestEpochSequenceId(UUID inboxId) {
        Labyrinth labyrinth = labyrinthService.getByChatInboxId(inboxId);

        return new GetNewestEpochSequenceIdResponseDTO(
                epochService.getNewestEpochSequenceId(labyrinth)
        );
    }

    @Transactional
    public GetNewerEpochJoinDataResponseDTO getNewerEpochJoinDataForDevice(String newerEpochSequenceId, UUID deviceId, UUID inboxId) {
        Labyrinth labyrinth = labyrinthService.getByChatInboxId(inboxId);

        Epoch epoch = epochService.getEpochBySequenceIdAndLabyrinth(newerEpochSequenceId, labyrinth);
        Device recipientDevice = deviceService.getDeviceByIdAndLabyrinth(deviceId, labyrinth);

        Example<EncryptedEpochEntropyForDevice> deviceEncryptedEpochEntropyExample = Example.of(EncryptedEpochEntropyForDevice.builder()
                .epoch(epoch)
                .recipientDevice(recipientDevice)
                .build()
        );
        EncryptedEpochEntropyForDevice encryptedEpochEntropyForDevice = encryptedEpochEntropyForDeviceRepository.findOne(
                deviceEncryptedEpochEntropyExample
        ).orElseThrow();

        return new GetNewerEpochJoinDataResponseDTO(
                epoch.getId(),
                encryptedEpochEntropyForDevice.getEncryptedEpochEntropy(),
                deviceMapper.toDevicePublicKeyBundleDTO(encryptedEpochEntropyForDevice.getSenderDevice())
        );
    }

    @Transactional
    public GetNewerEpochJoinDataResponseDTO getNewerEpochJoinDataForVirtualDevice(String newerEpochSequenceId, UUID inboxId) {
        Labyrinth labyrinth = labyrinthService.getByChatInboxId(inboxId);

        Epoch epoch = epochService.getEpochBySequenceIdAndLabyrinth(newerEpochSequenceId, labyrinth);

        EncryptedEpochEntropyForVirtualDevice encryptedEpochEntropyForVirtualDevice = encryptedEpochEntropyForVirtualDeviceRepository.findOne(
                Example.of(EncryptedEpochEntropyForVirtualDevice.builder()
                        .epoch(epoch)
                        .build()
                )
        ).orElseThrow();

        return new GetNewerEpochJoinDataResponseDTO(
                epoch.getId(),
                encryptedEpochEntropyForVirtualDevice.getEncryptedEpochEntropy(),
                deviceMapper.toDevicePublicKeyBundleDTO(encryptedEpochEntropyForVirtualDevice.getSenderDevice())
        );
    }
}
