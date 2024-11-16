package edu.pw.chat.labyrinth.common.mappers;

import edu.pw.chat.labyrinth.common.dtos.VirtualDeviceEncryptedRecoverySecretsDTO;
import edu.pw.chat.labyrinth.common.dtos.VirtualDevicePublicKeyBundleDTO;
import edu.pw.chat.labyrinth.common.entities.VirtualDevice;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper
public interface VirtualDeviceMapper {

    @Mapping(target = "id", source = "id")
    @Mapping(target = "virtualDeviceEncryptedRecoverySecrets", source = "virtualDeviceEncryptedRecoverySecretsDTO")
    VirtualDevice toEntity(
            String id,
            VirtualDeviceEncryptedRecoverySecretsDTO virtualDeviceEncryptedRecoverySecretsDTO,
            VirtualDevicePublicKeyBundleDTO virtualDevicePublicKeyBundleDTO
    );
}
