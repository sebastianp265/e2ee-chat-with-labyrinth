package edu.pw.safechat.labyrinth.internal.services;

import edu.pw.safechat.labyrinth.dtos.GetDevicesInEpochResponseDTO;
import edu.pw.safechat.labyrinth.dtos.common.DevicePublicKeyBundleWithoutEpochStorageAuthKeyPairDTO;
import edu.pw.safechat.labyrinth.internal.entities.*;
import edu.pw.safechat.labyrinth.internal.repositories.DeviceEpochMembershipProofRepository;
import edu.pw.safechat.labyrinth.internal.repositories.VirtualDeviceEpochMembershipProofRepository;
import edu.pw.safechat.labyrinth.internal.repositories.VirtualDeviceRepository;
import edu.pw.safechat.labyrinth.internal.services.common.EpochService;
import edu.pw.safechat.labyrinth.internal.services.common.LabyrinthService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Example;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class GetDevicesService {

    private final LabyrinthService labyrinthService;
    private final DeviceEpochMembershipProofRepository deviceEpochMembershipProofRepository;
    private final VirtualDeviceEpochMembershipProofRepository virtualDeviceEpochMembershipProofRepository;
    private final VirtualDeviceRepository virtualDeviceRepository;
    private final EpochService epochService;

    // TODO: Remove transactional
    @Transactional
    public GetDevicesInEpochResponseDTO getDevicesInEpoch(UUID epochId, UUID inboxId) {
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

        return new GetDevicesInEpochResponseDTO(
                deviceEpochMembershipProofRepository.findAll(deviceEpochMembershipProofExample)
                        .stream()
                        .map(dp -> new GetDevicesInEpochResponseDTO.DeviceInEpoch(
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
                        .map(vdp -> new GetDevicesInEpochResponseDTO.VirtualDeviceInEpoch(
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
}
