package edu.pw.chat.labyrinth.epoch.opennext;

import edu.pw.chat.labyrinth.common.entities.Epoch;
import edu.pw.chat.labyrinth.common.repositories.EpochRepository;
import edu.pw.chat.user.services.ChatUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class GetDevicesService {

    private final EpochRepository epochRepository;
    private final ChatUserService chatUserService;
    private final GetDevicesInEpochResponseMapper getDevicesInEpochResponseMapper;

    public GetDevicesInEpochResponseDTO getDevicesInEpoch(UUID epochID, String username) {
        UUID userID = chatUserService.getUserIDByUsername(username);

        Epoch epoch = epochRepository.findByIdAndChatInbox_UserID(epochID, userID)
                .orElseThrow(EpochAccessDeniedException::new);

        return getDevicesInEpochResponseMapper.toDTO(
                epoch.getDeviceEpochMembershipProofs(),
                epoch.getVirtualDeviceEpochMembershipProof()
        );
    }
}
