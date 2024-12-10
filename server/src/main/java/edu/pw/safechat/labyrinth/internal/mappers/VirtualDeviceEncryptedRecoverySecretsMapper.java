package edu.pw.safechat.labyrinth.internal.mappers;

import edu.pw.safechat.labyrinth.dtos.common.VirtualDeviceEncryptedRecoverySecretsDTO;
import edu.pw.safechat.labyrinth.internal.entities.Epoch;
import edu.pw.safechat.labyrinth.internal.entities.Labyrinth;
import edu.pw.safechat.labyrinth.internal.entities.VirtualDevice;
import edu.pw.safechat.labyrinth.internal.entities.VirtualDeviceEncryptedRecoverySecrets;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper
public interface VirtualDeviceEncryptedRecoverySecretsMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "epoch", source = "epoch")
    @Mapping(target = "virtualDevice", source = "virtualDevice")
    @Mapping(target = "labyrinth", source = "labyrinth")
    VirtualDeviceEncryptedRecoverySecrets toEntity(
            VirtualDeviceEncryptedRecoverySecretsDTO virtualDeviceEncryptedRecoverySecretsDTO,
            Epoch epoch,
            VirtualDevice virtualDevice,
            Labyrinth labyrinth
    );

}
