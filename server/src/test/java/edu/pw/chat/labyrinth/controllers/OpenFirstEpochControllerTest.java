package edu.pw.chat.labyrinth.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import edu.pw.chat.config.TestSecurityConfig;
import edu.pw.chat.labyrinth.common.dtos.DevicePublicKeyBundleDTO;
import edu.pw.chat.labyrinth.common.dtos.VirtualDeviceEncryptedRecoverySecretsDTO;
import edu.pw.chat.labyrinth.common.dtos.VirtualDevicePublicKeyBundleDTO;
import edu.pw.chat.labyrinth.common.entities.*;
import edu.pw.chat.labyrinth.common.repositories.*;
import edu.pw.chat.labyrinth.epoch.openfirst.dtos.OpenFirstEpochBodyDTO;
import edu.pw.chat.labyrinth.epoch.openfirst.dtos.OpenFirstEpochBodyDTO.FirstEpochMembershipProof;
import edu.pw.chat.labyrinth.epoch.openfirst.dtos.OpenFirstEpochResponseDTO;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithUserDetails;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.jdbc.Sql;
import org.springframework.test.web.servlet.MockMvc;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@Sql(
        scripts = {"/database/clean.sql", "/database/users.sql"},
        executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD
)
@AutoConfigureMockMvc
@ActiveProfiles("test")
@ContextConfiguration(classes = TestSecurityConfig.class)
class OpenFirstEpochControllerTest {

    @Autowired
    private MockMvc mockMvc;
    private final ObjectMapper objectMapper = new ObjectMapper();
    @Autowired
    private EpochRepository epochRepository;

    private final String validVirtualDeviceID = "123";
    private final VirtualDeviceEncryptedRecoverySecretsDTO validVirtualDeviceEncryptedRecoverySecretsDTO =
            new VirtualDeviceEncryptedRecoverySecretsDTO(
                    new byte[1],
                    new byte[1],
                    new byte[1],
                    new byte[1]
            );
    private final VirtualDevicePublicKeyBundleDTO validVirtualDevicePublicKeyBundleDTO =
            new VirtualDevicePublicKeyBundleDTO(
                    new byte[1],
                    new byte[1],
                    new byte[1]
            );
    private final DevicePublicKeyBundleDTO validDevicePublicKeyBundleDTO =
            new DevicePublicKeyBundleDTO(
                    new byte[1],
                    new byte[1],
                    new byte[1],
                    new byte[1],
                    new byte[1]
            );
    private final FirstEpochMembershipProof validFirstEpochMembershipProof =
            new FirstEpochMembershipProof(
                    new byte[1],
                    new byte[1]
            );
    @Autowired
    private DeviceEpochMembershipProofRepository deviceEpochMembershipProofRepository;
    @Autowired
    private DeviceRepository deviceRepository;
    @Autowired
    private VirtualDeviceRepository virtualDeviceRepository;
    @Autowired
    private VirtualDeviceEpochMembershipProofRepository virtualDeviceEpochMembershipProofRepository;

    @Test
    @WithUserDetails("user123")
    void shouldReturnCreatedWhenDataIsValidAndUserExists() throws Exception {
        // Given
        var validOpenFirstEpochBodyDTO = new OpenFirstEpochBodyDTO(
                validVirtualDeviceID,
                validVirtualDeviceEncryptedRecoverySecretsDTO,
                validVirtualDevicePublicKeyBundleDTO,
                validDevicePublicKeyBundleDTO,
                validFirstEpochMembershipProof
        );

        // When
        var actualResponse = objectMapper.readValue(
                mockMvc.perform(
                                post("/api/labyrinth/epochs/open-first")
                                        .contentType(MediaType.APPLICATION_JSON)
                                        .content(objectMapper.writeValueAsString(validOpenFirstEpochBodyDTO)))
                        .andExpect(status().isCreated())
                        .andReturn().getResponse().getContentAsString(),
                OpenFirstEpochResponseDTO.class
        );

        // Then
        var expectedEpochInDB = Epoch.builder()
                .id(actualResponse.epochID())
                .sequenceID("0")
                .build();

        var expectedDeviceEpochMembershipProof = DeviceEpochMembershipProof.builder()
                .epoch(expectedEpochInDB)
                .device(Device.builder()
                        .id(actualResponse.deviceID())
                        .deviceKeyPub(new byte[1])
                        .epochStorageAuthKeyPub(new byte[1])
                        .epochStorageAuthKeySig(new byte[1])
                        .epochStorageKeyPub(new byte[1])
                        .epochStorageKeySig(new byte[1])
                        .build())
                .epochDeviceMac(new byte[1])
                .build();

        var expectedVirtualDeviceEpochMembershipProof = VirtualDeviceEpochMembershipProof.builder()
                .epoch(expectedEpochInDB)
                .virtualDevice(VirtualDevice.builder()
                        .id(validVirtualDeviceID)
                        .deviceKeyPub(new byte[1])
                        .epochStorageKeyPub(new byte[1])
                        .epochStorageKeySig(new byte[1])
                        .virtualDeviceEncryptedRecoverySecrets(VirtualDeviceEncryptedRecoverySecrets.builder()
                                .encryptedEpochSequenceID(new byte[1])
                                .encryptedEpochStorageKeyPriv(new byte[1])
                                .encryptedEpochRootKey(new byte[1])
                                .encryptedDeviceKeyPriv(new byte[1])
                                .build()
                        )
                        .build()
                )
                .epochDeviceMac(new byte[1])
                .build();

        assertEquals(1, epochRepository.count());
        assertEquals(1, deviceRepository.count());
        assertEquals(1, deviceEpochMembershipProofRepository.count());
        assertEquals(1, virtualDeviceRepository.count());
        assertEquals(1, virtualDeviceEpochMembershipProofRepository.count());

        assertThat(deviceEpochMembershipProofRepository.findAll().getFirst())
                .usingRecursiveComparison()
                .ignoringFields("id")
                .isEqualTo(expectedDeviceEpochMembershipProof);

        assertThat(virtualDeviceEpochMembershipProofRepository.findAll().getFirst())
                .usingRecursiveComparison()
                .ignoringFields("id", "virtualDevice.virtualDeviceEncryptedRecoverySecrets.id")
                .isEqualTo(expectedVirtualDeviceEpochMembershipProof);
    }

}