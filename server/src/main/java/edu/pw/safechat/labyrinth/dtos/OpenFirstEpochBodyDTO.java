package edu.pw.safechat.labyrinth.dtos;

import edu.pw.safechat.labyrinth.dtos.common.DevicePublicKeyBundleDTO;
import edu.pw.safechat.labyrinth.dtos.common.VirtualDeviceEncryptedRecoverySecretsDTO;
import edu.pw.safechat.labyrinth.dtos.common.VirtualDevicePublicKeyBundleDTO;

public record OpenFirstEpochBodyDTO(
        byte[] virtualDeviceId,
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
