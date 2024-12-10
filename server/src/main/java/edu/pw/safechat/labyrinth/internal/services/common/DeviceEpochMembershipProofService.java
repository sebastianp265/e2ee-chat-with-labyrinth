package edu.pw.safechat.labyrinth.internal.services.common;

import edu.pw.safechat.labyrinth.internal.entities.Device;
import edu.pw.safechat.labyrinth.internal.entities.DeviceEpochMembershipProof;
import edu.pw.safechat.labyrinth.internal.entities.Epoch;
import edu.pw.safechat.labyrinth.internal.repositories.DeviceEpochMembershipProofRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class DeviceEpochMembershipProofService {

    private final DeviceEpochMembershipProofRepository deviceEpochMembershipProofRepository;

    public void createAndSave(
            Epoch epoch,
            Device device,
            byte[] epochDeviceMac
    ) {
        deviceEpochMembershipProofRepository.save(
                DeviceEpochMembershipProof.builder()
                        .epoch(epoch)
                        .device(device)
                        .epochDeviceMac(epochDeviceMac)
                        .build()
        );
    }
}
