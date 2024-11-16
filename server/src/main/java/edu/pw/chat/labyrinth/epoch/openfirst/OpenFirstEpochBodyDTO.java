package edu.pw.chat.labyrinth.epoch.openfirst;

import edu.pw.chat.labyrinth.common.dtos.DevicePublicKeyBundleDTO;
import edu.pw.chat.labyrinth.common.dtos.VirtualDeviceEncryptedRecoverySecretsDTO;
import edu.pw.chat.labyrinth.common.dtos.VirtualDevicePublicKeyBundleDTO;

public record OpenFirstEpochBodyDTO(
        String virtualDeviceID,
        VirtualDeviceEncryptedRecoverySecretsDTO virtualDeviceEncryptedRecoverySecretsDTO,
        VirtualDevicePublicKeyBundleDTO virtualDevicePublicKeyBundleDTO,
        DevicePublicKeyBundleDTO devicePublicKeyBundleDTO,
        FirstEpochMembershipProof firstEpochMembershipProof
) {

    public record FirstEpochMembershipProof(
            byte[] epochDeviceMac,
            byte[] epochVirtualDeviceMac
    ) {
    }
}
