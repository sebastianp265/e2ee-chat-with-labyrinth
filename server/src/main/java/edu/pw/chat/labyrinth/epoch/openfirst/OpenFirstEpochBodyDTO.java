package edu.pw.chat.labyrinth.epoch.openfirst;

import edu.pw.chat.labyrinth.common.dtos.DevicePublicKeyBundleDTO;
import edu.pw.chat.labyrinth.common.dtos.VirtualDeviceEncryptedRecoverySecretsDTO;
import edu.pw.chat.labyrinth.common.dtos.VirtualDevicePublicKeyBundleDTO;

public record OpenFirstEpochBodyDTO(
        String virtualDeviceID,
        VirtualDeviceEncryptedRecoverySecretsDTO virtualDeviceEncryptedRecoverySecrets,
        VirtualDevicePublicKeyBundleDTO virtualDevicePublicKeyBundle,
        DevicePublicKeyBundleDTO devicePublicKeyBundle,
        FirstEpochMembershipProof firstEpochMembershipProof
) {

    public record FirstEpochMembershipProof(
            byte[] epochDeviceMac,
            byte[] epochVirtualDeviceMac
    ) {
    }
}
