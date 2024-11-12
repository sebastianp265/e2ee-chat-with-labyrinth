package edu.pw.chat.labyrinth.common.repositories;

import edu.pw.chat.labyrinth.common.entities.VirtualDeviceEncryptedRecoverySecrets;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VirtualDeviceEncryptedRecoverySecretsRepository extends JpaRepository<VirtualDeviceEncryptedRecoverySecrets, Long> {
}