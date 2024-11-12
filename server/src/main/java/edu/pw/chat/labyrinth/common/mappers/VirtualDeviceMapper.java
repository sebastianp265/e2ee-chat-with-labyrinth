package edu.pw.chat.labyrinth.common.mappers;

import edu.pw.chat.labyrinth.common.dtos.VirtualDevicePublicKeyBundleDTO;
import edu.pw.chat.labyrinth.common.entities.VirtualDevice;
import edu.pw.chat.labyrinth.common.entities.VirtualDeviceEncryptedRecoverySecrets;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper
public interface VirtualDeviceMapper {

    @Mapping(target = "id", source = "id")
    @Mapping(target = "virtualDeviceEncryptedRecoverySecrets", source = "virtualDeviceEncryptedRecoverySecrets")
    VirtualDevice toEntity(
            String id,
            VirtualDeviceEncryptedRecoverySecrets virtualDeviceEncryptedRecoverySecrets,
            VirtualDevicePublicKeyBundleDTO virtualDevicePublicKeyBundleDTO
    );
}
