package edu.pw.safechat.labyrinth.internal.mappers;

import edu.pw.safechat.labyrinth.dtos.GetVirtualDeviceRecoverySecretsResponseDTO;
import edu.pw.safechat.labyrinth.internal.entities.VirtualDeviceEncryptedRecoverySecrets;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper
public interface GetVirtualDeviceRecoverySecretsResponseMapper {

    @Mapping(target = "epochId", source = "virtualDeviceEncryptedRecoverySecrets.epoch.id")
    @Mapping(target = "virtualDeviceEncryptedRecoverySecrets", source = "virtualDeviceEncryptedRecoverySecrets")
    @Mapping(target = "expectedVirtualDevicePublicKeyBundle", source = "virtualDeviceEncryptedRecoverySecrets.virtualDevice")
    GetVirtualDeviceRecoverySecretsResponseDTO toDTO(
            VirtualDeviceEncryptedRecoverySecrets virtualDeviceEncryptedRecoverySecrets
    );
}
