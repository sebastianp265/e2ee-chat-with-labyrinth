package edu.pw.chat.labyrinth.epoch.opennext;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/labyrinth/epochs")
@RequiredArgsConstructor
public class OpenNewEpochBasedOnCurrentController {

    private final GetDevicesService getDevicesService;

    @GetMapping("/{epochID}/devices")
    public ResponseEntity<GetDevicesInEpochResponseDTO> getDevicesInEpoch(
            @PathVariable UUID epochID,
            Authentication authentication
    ) {
        GetDevicesInEpochResponseDTO getDevicesInEpochResponseDTO = getDevicesService.getDevicesInEpoch(
                epochID,
                authentication.getName()
        );

        return ResponseEntity.ok(getDevicesInEpochResponseDTO);
    }

    @PostMapping("/open-based-on-current/{currentEpochID}")
    public ResponseEntity<OpenNewEpochBasedOnCurrentResponseDTO> openNewEpochBasedOnCurrent(
            @PathVariable UUID currentEpochID,
            @RequestBody OpenNewEpochBasedOnCurrentBodyDTO openNewEpochBasedOnCurrentBodyDTO,
            Authentication authentication
    ) {
        throw new UnsupportedOperationException("Not implemented yet");
    }
}
