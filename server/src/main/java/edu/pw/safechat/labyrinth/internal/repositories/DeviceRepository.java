package edu.pw.safechat.labyrinth.internal.repositories;

import edu.pw.safechat.labyrinth.internal.entities.Device;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface DeviceRepository extends JpaRepository<Device, UUID> {
}
