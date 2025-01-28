package edu.pw.safechat.labyrinth.internal.services;

import edu.pw.safechat.labyrinth.dtos.AllDevicesDTO;
import edu.pw.safechat.labyrinth.dtos.OpenNewEpochBasedOnCurrentBodyDTO;
import edu.pw.safechat.labyrinth.dtos.OpenNewEpochBasedOnCurrentResponseDTO;
import edu.pw.safechat.labyrinth.dtos.common.DevicePublicKeyBundleWithoutEpochStorageAuthKeyPairDTO;
import edu.pw.safechat.labyrinth.internal.entities.*;
import edu.pw.safechat.labyrinth.internal.repositories.DeviceEpochMembershipProofRepository;
import edu.pw.safechat.labyrinth.internal.repositories.EncryptedEpochEntropyForDeviceRepository;
import edu.pw.safechat.labyrinth.internal.repositories.VirtualDeviceEpochMembershipProofRepository;
import edu.pw.safechat.labyrinth.internal.repositories.VirtualDeviceRepository;
import edu.pw.safechat.labyrinth.internal.services.common.*;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Example;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OpenNewEpochBasedOnCurrentService {

    private final LabyrinthService labyrinthService;
    private final DeviceEpochMembershipProofRepository deviceEpochMembershipProofRepository;
    private final VirtualDeviceEpochMembershipProofRepository virtualDeviceEpochMembershipProofRepository;
    private final VirtualDeviceRepository virtualDeviceRepository;
    private final EpochService epochService;
    private final EncryptedEpochEntropyForDeviceRepository encryptedEpochEntropyForDeviceRepository;
    private final DeviceEpochMembershipProofService deviceEpochMembershipProofService;
    private final VirtualDeviceEpochMembershipProofService virtualDeviceEpochMembershipProofService;
    private final DeviceService deviceService;
    private final EncryptedEpochEntropyForVirtualDeviceRepository encryptedEpochEntropyForVirtualDeviceRepository;

    // TODO: Remove transactional
    @Transactional
    public AllDevicesDTO getDevicesInEpoch(UUID epochId, UUID inboxId) {
        Labyrinth labyrinth = labyrinthService.getByChatInboxId(inboxId);
        Epoch epochProbe = epochService.getEpochByIdAndLabyrinth(epochId, labyrinth);

        Example<DeviceEpochMembershipProof> deviceEpochMembershipProofExample = Example.of(
                DeviceEpochMembershipProof.builder()
                        .epoch(epochProbe)
                        .build()
        );

        Example<VirtualDeviceEpochMembershipProof> virtualDeviceEpochMembershipProofExample = Example.of(
                VirtualDeviceEpochMembershipProof.builder()
                        .epoch(epochProbe)
                        .build()
        );

        Example<VirtualDevice> virtualDeviceExample = Example.of(
                VirtualDevice.builder()
                        .labyrinth(labyrinth)
                        .build()
        );

        VirtualDevice virtualDevice = virtualDeviceRepository.findOne(virtualDeviceExample)
                .orElseThrow();

        return new AllDevicesDTO(
                deviceEpochMembershipProofRepository.findAll(deviceEpochMembershipProofExample)
                        .stream()
                        .filter(dp -> deviceService.isDeviceActive(dp.getDevice()))
                        .map(dp -> new AllDevicesDTO.DeviceInEpoch(
                                dp.getDevice().getId(),
                                dp.getEpochDeviceMac(),
                                new DevicePublicKeyBundleWithoutEpochStorageAuthKeyPairDTO(
                                        dp.getDevice().getDeviceKeyPub(),
                                        dp.getDevice().getEpochStorageKeyPub(),
                                        dp.getDevice().getEpochStorageKeySig()
                                )
                        ))
                        .toList(),
                virtualDeviceEpochMembershipProofRepository.findOne(virtualDeviceEpochMembershipProofExample)
                        .map(vdp -> new AllDevicesDTO.VirtualDeviceInEpoch(
                                vdp.getEpochDeviceMac(),
                                new DevicePublicKeyBundleWithoutEpochStorageAuthKeyPairDTO(
                                        virtualDevice.getDeviceKeyPub(),
                                        virtualDevice.getEpochStorageKeyPub(),
                                        virtualDevice.getEpochStorageKeySig()
                                )
                        ))
                        .orElseThrow()
        );
    }

    @Transactional
    public OpenNewEpochBasedOnCurrentResponseDTO openNewEpochBasedOnCurrent(
            UUID currentEpochId,
            UUID deviceId,
            OpenNewEpochBasedOnCurrentBodyDTO openNewEpochBasedOnCurrentBodyDTO,
            UUID inboxId
    ) {
        Labyrinth labyrinth = labyrinthService.getByChatInboxId(inboxId);
        Device senderDevice = deviceService.getDeviceByIdAndLabyrinth(deviceId, labyrinth);

        Epoch currentEpoch = epochService.getEpochByIdAndLabyrinth(currentEpochId, labyrinth);
        String newestEpochSequenceId = epochService.getNewestEpochSequenceId(labyrinth);
        if (!newestEpochSequenceId.equals(currentEpoch.getSequenceId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST);
        }

        Epoch newCreatedEpoch = epochService.createAndSave(
                labyrinth,
                epochService.getNewerEpochSequenceId(newestEpochSequenceId)
        );

        encryptedEpochEntropyForDeviceRepository.saveAll(
                openNewEpochBasedOnCurrentBodyDTO.encryptedNewEpochEntropyForEveryDeviceInEpoch()
                        .deviceIdToEncryptedNewEpochEntropyMap()
                        .entrySet()
                        .stream().map(e -> EncryptedEpochEntropyForDevice
                                .builder()
                                .recipientDevice(Device.builder()
                                        .id(e.getKey())
                                        .build())
                                .senderDevice(senderDevice)
                                .encryptedEpochEntropy(e.getValue())
                                .epoch(newCreatedEpoch)
                                .build()
                        )
                        .toList()
        );

        encryptedEpochEntropyForVirtualDeviceRepository.save(
                EncryptedEpochEntropyForVirtualDevice.builder()
                        .epoch(newCreatedEpoch)
                        .senderDevice(senderDevice)
                        .encryptedEpochEntropy(
                                openNewEpochBasedOnCurrentBodyDTO.encryptedNewEpochEntropyForEveryDeviceInEpoch()
                                        .virtualDeviceEncryptedNewEpochEntropy()
                        )
                        .build()
        );

        deviceEpochMembershipProofService.createAndSave(
                newCreatedEpoch,
                Device.builder()
                        .id(senderDevice.getId())
                        .build(),
                openNewEpochBasedOnCurrentBodyDTO.newEpochMembershipProof().epochThisDeviceMac()
        );

        virtualDeviceEpochMembershipProofService.createAndSave(
                newCreatedEpoch,
                openNewEpochBasedOnCurrentBodyDTO.newEpochMembershipProof().epochVirtualDeviceMac()
        );

        return new OpenNewEpochBasedOnCurrentResponseDTO(
                newCreatedEpoch.getId()
        );
    }
}
