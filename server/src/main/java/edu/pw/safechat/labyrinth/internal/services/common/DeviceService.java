package edu.pw.safechat.labyrinth.internal.services.common;

import edu.pw.safechat.labyrinth.dtos.common.DevicePublicKeyBundleDTO;
import edu.pw.safechat.labyrinth.internal.entities.Device;
import edu.pw.safechat.labyrinth.internal.entities.Labyrinth;
import edu.pw.safechat.labyrinth.internal.mappers.DeviceMapper;
import edu.pw.safechat.labyrinth.internal.repositories.DeviceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class DeviceService {

    private final DeviceRepository deviceRepository;
    private final DeviceMapper deviceMapper;

    public Device createAndSave(
            DevicePublicKeyBundleDTO devicePublicKeyBundleDTO,
            Labyrinth labyrinth
    ) {
        return deviceRepository.save(
                deviceMapper.toEntity(
                        devicePublicKeyBundleDTO,
                        labyrinth
                )
        );
    }
}
