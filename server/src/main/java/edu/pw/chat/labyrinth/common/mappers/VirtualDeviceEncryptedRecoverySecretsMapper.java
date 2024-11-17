package edu.pw.chat.labyrinth.common.mappers;

import edu.pw.chat.labyrinth.common.dtos.VirtualDeviceEncryptedRecoverySecretsDTO;
import edu.pw.chat.labyrinth.common.entities.Epoch;
import edu.pw.chat.labyrinth.common.entities.VirtualDevice;
import edu.pw.chat.labyrinth.common.entities.VirtualDeviceEncryptedRecoverySecrets;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper
public interface VirtualDeviceEncryptedRecoverySecretsMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "epoch", source = "epoch")
    @Mapping(target = "virtualDevice", source = "virtualDevice")
    VirtualDeviceEncryptedRecoverySecrets toEntity(
            VirtualDeviceEncryptedRecoverySecretsDTO virtualDeviceEncryptedRecoverySecretsDTO,
            Epoch epoch,
            VirtualDevice virtualDevice
    );

}
