package edu.pw.safechat.labyrinth.dtos;

import edu.pw.safechat.labyrinth.dtos.common.VirtualDeviceEncryptedRecoverySecretsDTO;
import edu.pw.safechat.labyrinth.dtos.common.VirtualDevicePublicKeyBundleDTO;

public record GetVirtualDeviceRecoverySecretsResponseDTO(
        String epochId,
        VirtualDeviceEncryptedRecoverySecretsDTO virtualDeviceEncryptedRecoverySecrets,
        VirtualDevicePublicKeyBundleDTO expectedVirtualDevicePublicKeyBundle
) {

}
