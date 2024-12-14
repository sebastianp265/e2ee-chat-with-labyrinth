package edu.pw.safechat.labyrinth.internal.services.common;

import edu.pw.safechat.labyrinth.internal.entities.Epoch;
import edu.pw.safechat.labyrinth.internal.entities.VirtualDeviceEpochMembershipProof;
import edu.pw.safechat.labyrinth.internal.repositories.VirtualDeviceEpochMembershipProofRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class VirtualDeviceEpochMembershipProofService {

    private final VirtualDeviceEpochMembershipProofRepository virtualDeviceEpochMembershipProofRepository;

    public void createAndSave(
            Epoch epoch,
            byte[] epochDeviceMac
    ) {
        virtualDeviceEpochMembershipProofRepository.save(
                VirtualDeviceEpochMembershipProof.builder()
                        .epoch(epoch)
                        .epochDeviceMac(epochDeviceMac)
                        .build()
        );
    }
}
