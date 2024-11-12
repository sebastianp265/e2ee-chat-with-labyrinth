package edu.pw.chat.labyrinth.epoch.openfirst;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/labyrinth/epochs")
@RequiredArgsConstructor
public class OpenFirstEpochController {

    private final OpenFirstEpochService openFirstEpochService;

    @PostMapping("/open-first")
    public ResponseEntity<OpenFirstEpochResponseDTO> openFirstEpoch(
            @RequestBody OpenFirstEpochBodyDTO openFirstEpochBodyDTO,
            Authentication authentication
    ) {
        OpenFirstEpochResponseDTO openFirstEpochResponseDTO = openFirstEpochService.openFirstEpoch(
                openFirstEpochBodyDTO,
                authentication.getName()
        );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(openFirstEpochResponseDTO);
    }

}
