package edu.pw.chat.labyrinth.epoch.openfirst;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import edu.pw.chat.config.TestSecurityConfig;
import edu.pw.chat.labyrinth.common.dtos.DevicePublicKeyBundleDTO;
import edu.pw.chat.labyrinth.common.dtos.VirtualDeviceEncryptedRecoverySecretsDTO;
import edu.pw.chat.labyrinth.common.dtos.VirtualDevicePublicKeyBundleDTO;
import edu.pw.chat.labyrinth.common.entities.*;
import edu.pw.chat.labyrinth.common.repositories.*;
import edu.pw.chat.utils.TestUtils;
import jakarta.transaction.Transactional;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.test.context.support.WithUserDetails;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.jdbc.Sql;
import org.springframework.test.web.servlet.MockMvc;

import java.io.UnsupportedEncodingException;
import java.util.List;
import java.util.UUID;

import static edu.pw.chat.utils.TestUtils.get32RandomBytes;
import static org.assertj.core.api.AssertionsForClassTypes.assertThat;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;

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
    @Autowired
    private DeviceEpochMembershipProofRepository deviceEpochMembershipProofRepository;
    @Autowired
    private DeviceRepository deviceRepository;
    @Autowired
    private VirtualDeviceEpochMembershipProofRepository virtualDeviceEpochMembershipProofRepository;
    @Autowired
    private VirtualDeviceRepository virtualDeviceRepository;

    private OpenFirstEpochBodyDTO openFirstEpochBodyDTO;
    private MockHttpServletResponse actualResponse;

    @Test
    @WithUserDetails("testUser")
    @Transactional
    void shouldOpenFirstEpochInDBAndReturnStatusCreatedGivenValidDTO() throws Exception {
        givenValidOpenFirstEpochBodyDTO();

        whenUserSendsDTO();

        thenResponseStatusIsCreated();
        thenDataFromRequestAreSavedInDB();
    }

    private void givenValidOpenFirstEpochBodyDTO() {
        var validVirtualDeviceID = TestUtils.get40RandomCharactersString();
        var validVirtualDeviceEncryptedRecoverySecretsDTO = new VirtualDeviceEncryptedRecoverySecretsDTO(
                get32RandomBytes(),
                get32RandomBytes(),
                get32RandomBytes(),
                get32RandomBytes()
        );
        var validVirtualDevicePublicKeyBundleDTO = new VirtualDevicePublicKeyBundleDTO(
                get32RandomBytes(),
                get32RandomBytes(),
                get32RandomBytes()
        );
        var validDevicePublicKeyBundleDTO = new DevicePublicKeyBundleDTO(
                get32RandomBytes(),
                get32RandomBytes(),
                get32RandomBytes(),
                get32RandomBytes(),
                get32RandomBytes()
        );
        var validFirstEpochMembershipProof = new OpenFirstEpochBodyDTO.FirstEpochMembershipProof(
                get32RandomBytes(),
                get32RandomBytes()
        );
        openFirstEpochBodyDTO = new OpenFirstEpochBodyDTO(
                validVirtualDeviceID,
                validVirtualDeviceEncryptedRecoverySecretsDTO,
                validVirtualDevicePublicKeyBundleDTO,
                validDevicePublicKeyBundleDTO,
                validFirstEpochMembershipProof
        );
    }


    private void whenUserSendsDTO() throws Exception {
        actualResponse = mockMvc.perform(
                        post("/api/labyrinth/epochs/open-first")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(openFirstEpochBodyDTO)))
                .andReturn().getResponse();
    }

    private void thenResponseStatusIsCreated() {
        assertEquals(HttpStatus.CREATED.value(), actualResponse.getStatus());
    }

    private void thenDataFromRequestAreSavedInDB() throws UnsupportedEncodingException, JsonProcessingException {
        OpenFirstEpochResponseDTO actualResponseContent = objectMapper.readValue(
                actualResponse.getContentAsString(),
                OpenFirstEpochResponseDTO.class
        );

        var expectedEpochInDB = Epoch.builder()
                .id(actualResponseContent.epochID())
                .chatInbox(
                        ChatInbox.builder()
                                .userID(UUID.fromString("56beecb9-68d0-43f1-9b42-179fde863bc6"))
                                .build()
                )
                .deviceEpochMembershipProofs(List.of(DeviceEpochMembershipProof.builder()
                        .device(Device.builder()
                                .id(actualResponseContent.deviceID())
                                .deviceKeyPub(openFirstEpochBodyDTO.devicePublicKeyBundleDTO().deviceKeyPub())
                                .epochStorageAuthKeyPub(openFirstEpochBodyDTO.devicePublicKeyBundleDTO().epochStorageAuthKeyPub())
                                .epochStorageAuthKeySig(openFirstEpochBodyDTO.devicePublicKeyBundleDTO().epochStorageAuthKeySig())
                                .epochStorageKeyPub(openFirstEpochBodyDTO.devicePublicKeyBundleDTO().epochStorageKeyPub())
                                .epochStorageKeySig(openFirstEpochBodyDTO.devicePublicKeyBundleDTO().epochStorageKeySig())
                                .build())
                        .epochDeviceMac(openFirstEpochBodyDTO.firstEpochMembershipProof().epochDeviceMac())
                        .build())
                )
                .virtualDeviceEpochMembershipProof(VirtualDeviceEpochMembershipProof.builder()
                        .virtualDevice(VirtualDevice.builder()
                                .id(openFirstEpochBodyDTO.virtualDeviceID())
                                .deviceKeyPub(openFirstEpochBodyDTO.virtualDevicePublicKeyBundleDTO().deviceKeyPub())
                                .epochStorageKeyPub(openFirstEpochBodyDTO.virtualDevicePublicKeyBundleDTO().epochStorageKeyPub())
                                .epochStorageKeySig(openFirstEpochBodyDTO.virtualDevicePublicKeyBundleDTO().epochStorageKeySig())
                                .virtualDeviceEncryptedRecoverySecrets(VirtualDeviceEncryptedRecoverySecrets.builder()
                                        .encryptedEpochSequenceID(openFirstEpochBodyDTO.virtualDeviceEncryptedRecoverySecretsDTO().encryptedEpochSequenceID())
                                        .encryptedEpochStorageKeyPriv(openFirstEpochBodyDTO.virtualDeviceEncryptedRecoverySecretsDTO().encryptedEpochStorageKeyPriv())
                                        .encryptedEpochRootKey(openFirstEpochBodyDTO.virtualDeviceEncryptedRecoverySecretsDTO().encryptedEpochRootKey())
                                        .encryptedDeviceKeyPriv(openFirstEpochBodyDTO.virtualDeviceEncryptedRecoverySecretsDTO().encryptedDeviceKeyPriv())
                                        .build()
                                )
                                .build()
                        )
                        .epochDeviceMac(openFirstEpochBodyDTO.firstEpochMembershipProof().epochVirtualDeviceMac())
                        .build()
                )
                .sequenceID("0")
                .build();

        assertEquals(1, epochRepository.count());
        assertEquals(1, deviceRepository.count());
        assertEquals(1, deviceEpochMembershipProofRepository.count());
        assertEquals(1, virtualDeviceRepository.count());
        assertEquals(1, virtualDeviceEpochMembershipProofRepository.count());

        assertThat(epochRepository.findById(actualResponseContent.epochID()).orElseThrow())
                .usingRecursiveComparison()
                .ignoringFields(
                        "chatInbox.id",
                        "deviceEpochMembershipProofs.id",
                        "virtualDeviceEpochMembershipProof.id",
                        "virtualDeviceEpochMembershipProof.virtualDevice.virtualDeviceEncryptedRecoverySecrets.id"
                )
                .isEqualTo(expectedEpochInDB);
    }
}