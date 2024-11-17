package edu.pw.chat.labyrinth.virtualdevice.getrecoverysecrets;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/labyrinth/virtual-device")
@RequiredArgsConstructor
public class GetVirtualDeviceRecoverySecretsController {

    private final GetVirtualDeviceRecoverySecretsService getVirtualDeviceRecoverySecretsService;

    // TODO: Remove virtualDeviceID from path
    @GetMapping("/{virtualDeviceID}/recovery-secrets")
    public ResponseEntity<GetVirtualDeviceRecoverySecretsResponseDTO> getRecoverySecrets(
            @PathVariable String virtualDeviceID,
            Authentication authentication
    ) {

        return ResponseEntity.ok(
                getVirtualDeviceRecoverySecretsService.getRecoverySecrets(
                        virtualDeviceID,
                        authentication.getName()
                )
        );
    }
}
