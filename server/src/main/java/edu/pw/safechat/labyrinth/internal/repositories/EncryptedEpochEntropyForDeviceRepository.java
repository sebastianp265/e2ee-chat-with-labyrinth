package edu.pw.safechat.labyrinth.internal.repositories;

import edu.pw.safechat.labyrinth.internal.entities.Device;
import edu.pw.safechat.labyrinth.internal.entities.EncryptedEpochEntropyForDevice;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface EncryptedEpochEntropyForDeviceRepository extends JpaRepository<EncryptedEpochEntropyForDevice, Long> {

    Optional<EncryptedEpochEntropyForDevice> findByEpoch_SequenceIdAndRecipientDevice(String epochSequenceId, Device device);
}
