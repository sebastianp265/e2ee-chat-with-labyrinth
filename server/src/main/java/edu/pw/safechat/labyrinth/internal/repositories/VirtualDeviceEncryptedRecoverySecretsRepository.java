package edu.pw.safechat.labyrinth.internal.repositories;

import edu.pw.safechat.labyrinth.internal.entities.VirtualDeviceEncryptedRecoverySecrets;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VirtualDeviceEncryptedRecoverySecretsRepository extends JpaRepository<VirtualDeviceEncryptedRecoverySecrets, Long> {

}