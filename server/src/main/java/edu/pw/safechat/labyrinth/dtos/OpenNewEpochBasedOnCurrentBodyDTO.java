package edu.pw.safechat.labyrinth.dtos;

import java.util.Map;
import java.util.UUID;

public record OpenNewEpochBasedOnCurrentBodyDTO(
        EncryptedNewEpochEntropyForEveryDeviceInEpoch encryptedNewEpochEntropyForEveryDeviceInEpoch,
        NewEpochMembershipProof newEpochMembershipProof
) {

    public record EncryptedNewEpochEntropyForEveryDeviceInEpoch(
            Map<UUID, byte[]> deviceIdToEncryptedNewEpochEntropyMap,
            byte[] virtualDeviceEncryptedNewEpochEntropy
    ) {

    }

    public record NewEpochMembershipProof(
            byte[] epochThisDeviceMac,
            byte[] epochVirtualDeviceMac
    ) {

    }
}
