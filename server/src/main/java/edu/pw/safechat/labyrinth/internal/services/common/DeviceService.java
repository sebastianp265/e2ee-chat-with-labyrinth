package edu.pw.safechat.labyrinth.internal.services.common;

import edu.pw.safechat.labyrinth.dtos.common.DevicePublicKeyBundleDTO;
import edu.pw.safechat.labyrinth.internal.entities.Device;
import edu.pw.safechat.labyrinth.internal.entities.Labyrinth;
import edu.pw.safechat.labyrinth.internal.mappers.DeviceMapper;
import edu.pw.safechat.labyrinth.internal.repositories.DeviceRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Example;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.Duration;
import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DeviceService {

    private final DeviceRepository deviceRepository;
    private final DeviceMapper deviceMapper;

    @Value("${app.labyrinth.max-device-inactivity}")
    private Duration maxDeviceInactivity;

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

    @Transactional
    public void updateLastActiveAt(Labyrinth labyrinth, UUID deviceId) {
        Example<Device> deviceExample = Example.of(Device.builder()
                .id(deviceId)
                .labyrinth(labyrinth)
                .build());
        if (!deviceRepository.exists(deviceExample)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        }

        deviceRepository.updateLastActiveAtById(deviceId, Instant.now());
    }

    public boolean didAnyDeviceExceedInactivityLimit(Labyrinth labyrinth) {
        return deviceRepository.existsByLabyrinthAndLastActiveAtLessThan(
                labyrinth,
                Instant.now().minus(maxDeviceInactivity)
        );
    }

    public boolean isDeviceActive(Device device) {
        return device.getLastActiveAt()
                .plus(maxDeviceInactivity)
                .isBefore(Instant.now());
    }

    public Device getDeviceByIdAndLabyrinth(UUID deviceId, Labyrinth labyrinth) {
        Example<Device> deviceExample = Example.of(Device.builder()
                .id(deviceId)
                .labyrinth(labyrinth)
                .build());

        return deviceRepository.findOne(deviceExample)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST));
    }
}
