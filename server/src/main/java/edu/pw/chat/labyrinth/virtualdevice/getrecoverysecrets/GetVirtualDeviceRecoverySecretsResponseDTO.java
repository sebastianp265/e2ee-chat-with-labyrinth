package edu.pw.chat.labyrinth.virtualdevice.getrecoverysecrets;

import edu.pw.chat.labyrinth.common.dtos.VirtualDeviceEncryptedRecoverySecretsDTO;
import edu.pw.chat.labyrinth.common.dtos.VirtualDevicePublicKeyBundleDTO;

public record GetVirtualDeviceRecoverySecretsResponseDTO(
        String epochID,
        VirtualDeviceEncryptedRecoverySecretsDTO virtualDeviceEncryptedRecoverySecrets,
        VirtualDevicePublicKeyBundleDTO expectedVirtualDevicePublicKeyBundle
) {

}
