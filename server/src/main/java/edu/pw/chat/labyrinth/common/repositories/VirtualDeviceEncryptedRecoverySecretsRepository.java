package edu.pw.chat.labyrinth.common.repositories;

import edu.pw.chat.labyrinth.common.entities.VirtualDeviceEncryptedRecoverySecrets;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface VirtualDeviceEncryptedRecoverySecretsRepository extends JpaRepository<VirtualDeviceEncryptedRecoverySecrets, Long> {

    Optional<VirtualDeviceEncryptedRecoverySecrets> findByVirtualDevice_IdAndVirtualDevice_ChatInbox_UserID(
            String virtualDeviceID,
            UUID userID
    );
}