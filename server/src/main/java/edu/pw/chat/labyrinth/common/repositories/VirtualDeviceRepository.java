package edu.pw.chat.labyrinth.common.repositories;

import edu.pw.chat.labyrinth.common.entities.VirtualDevice;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface VirtualDeviceRepository extends JpaRepository<VirtualDevice, UUID> {

    Optional<VirtualDevice> findByIdAndChatInbox_UserID(String id, UUID userID);
}
