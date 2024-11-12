package edu.pw.chat.labyrinth.common.mappers;

import edu.pw.chat.labyrinth.common.dtos.VirtualDeviceEncryptedRecoverySecretsDTO;
import edu.pw.chat.labyrinth.common.entities.VirtualDeviceEncryptedRecoverySecrets;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper
public interface VirtualDeviceEncryptedRecoverySecretsMapper {

    @Mapping(target = "id", ignore = true)
    VirtualDeviceEncryptedRecoverySecrets toEntity(
            VirtualDeviceEncryptedRecoverySecretsDTO virtualDeviceEncryptedRecoverySecretsDTO
    );
}
