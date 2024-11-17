package edu.pw.chat.labyrinth.epoch.join;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigInteger;

@RestController
@RequestMapping("/api/labyrinth/epochs")
@RequiredArgsConstructor
public class JoinEpochController {

    @GetMapping("/by-sequence-id/{newerEpochSequenceID}/newer-epoch-join-data")
    public ResponseEntity<GetNewerEpochJoinDataResponseDTO> getNewerEpochJoinData(
            @PathVariable BigInteger newerEpochSequenceID,
            Authentication authentication
    ) {
        throw new UnsupportedOperationException("Not implemented yet");
    }

    @GetMapping("/by-sequence-id/{olderEpochSequenceID}/older-epoch-join-data")
    public ResponseEntity<GetOlderEpochJoinDataResponse> getOlderEpochJoinData(
            @PathVariable BigInteger olderEpochSequenceID,
            Authentication authentication
    ) {
        throw new UnsupportedOperationException("Not implemented yet");
    }

    @GetMapping("/newest-sequence-id")
    public ResponseEntity<GetNewestEpochSequenceIDResponse> getNewestEpochSequenceID(
            Authentication authentication
    ) {
        throw new UnsupportedOperationException("Not implemented yet");
    }
}
