package edu.pw.chat.labyrinth.virtualdevice.getrecoverysecrets;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/labyrinth/virtual-device")
@RequiredArgsConstructor
public class GetVirtualDeviceRecoverySecretsController {

    private final GetVirtualDeviceRecoverySecretsService getVirtualDeviceRecoverySecretsService;

    @PostMapping("/recovery-secrets")
    public ResponseEntity<GetVirtualDeviceRecoverySecretsResponseDTO> getRecoverySecrets(
            @RequestBody GetVirtualDeviceRecoverySecretsBodyDTO getRecoverySecretsBodyDTO,
            Authentication authentication
    ) {

        return ResponseEntity.ok(
                getVirtualDeviceRecoverySecretsService.getRecoverySecrets(
                        getRecoverySecretsBodyDTO.virtualDeviceID(),
                        authentication.getName()
                )
        );
    }
}
