package edu.pw.chat.labyrinth.virtualdevice.getrecoverysecrets;

import edu.pw.chat.labyrinth.common.entities.VirtualDeviceEncryptedRecoverySecrets;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper
public interface GetVirtualDeviceRecoverySecretsResponseMapper {

    @Mapping(target = "epochID", source = "virtualDeviceEncryptedRecoverySecrets.epoch.id")
    @Mapping(target = "virtualDeviceEncryptedRecoverySecrets", source = "virtualDeviceEncryptedRecoverySecrets")
    @Mapping(target = "expectedVirtualDevicePublicKeyBundle", source = "virtualDeviceEncryptedRecoverySecrets.virtualDevice")
    GetVirtualDeviceRecoverySecretsResponseDTO toDTO(
            VirtualDeviceEncryptedRecoverySecrets virtualDeviceEncryptedRecoverySecrets
    );
}
