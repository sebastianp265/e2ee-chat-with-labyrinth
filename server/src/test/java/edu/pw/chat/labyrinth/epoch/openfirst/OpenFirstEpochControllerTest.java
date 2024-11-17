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
    @Autowired
    private VirtualDeviceEncryptedRecoverySecretsRepository virtualDeviceEncryptedRecoverySecretsRepository;

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
        assertEquals(1, epochRepository.count());
        assertEquals(1, deviceRepository.count());
        assertEquals(1, deviceEpochMembershipProofRepository.count());
        assertEquals(1, virtualDeviceRepository.count());
        assertEquals(1, virtualDeviceEpochMembershipProofRepository.count());

        OpenFirstEpochResponseDTO actualResponseContent = objectMapper.readValue(
                actualResponse.getContentAsString(),
                OpenFirstEpochResponseDTO.class
        );

        UUID userID = UUID.fromString("56beecb9-68d0-43f1-9b42-179fde863bc6");

        var expectedChatInbox = ChatInbox.builder()
                .userID(userID)
                .build();

        var expectedVirtualDevice = VirtualDevice.builder()
                .id(openFirstEpochBodyDTO.virtualDeviceID())
                .chatInbox(expectedChatInbox)
                .deviceKeyPub(openFirstEpochBodyDTO.virtualDevicePublicKeyBundle().deviceKeyPub())
                .epochStorageKeyPub(openFirstEpochBodyDTO.virtualDevicePublicKeyBundle().epochStorageKeyPub())
                .epochStorageKeySig(openFirstEpochBodyDTO.virtualDevicePublicKeyBundle().epochStorageKeySig())
                .build();

        var expectedEpochInDB = Epoch.builder()
                .id(actualResponseContent.epochID())
                .chatInbox(
                        expectedChatInbox
                )
                .deviceEpochMembershipProofs(List.of(DeviceEpochMembershipProof.builder()
                        .device(Device.builder()
                                .id(actualResponseContent.deviceID())
                                .deviceKeyPub(openFirstEpochBodyDTO.devicePublicKeyBundle().deviceKeyPub())
                                .epochStorageAuthKeyPub(openFirstEpochBodyDTO.devicePublicKeyBundle().epochStorageAuthKeyPub())
                                .epochStorageAuthKeySig(openFirstEpochBodyDTO.devicePublicKeyBundle().epochStorageAuthKeySig())
                                .epochStorageKeyPub(openFirstEpochBodyDTO.devicePublicKeyBundle().epochStorageKeyPub())
                                .epochStorageKeySig(openFirstEpochBodyDTO.devicePublicKeyBundle().epochStorageKeySig())
                                .build())
                        .epochDeviceMac(openFirstEpochBodyDTO.firstEpochMembershipProof().epochDeviceMac())
                        .build())
                )
                .virtualDeviceEpochMembershipProof(VirtualDeviceEpochMembershipProof.builder()
                        .virtualDevice(expectedVirtualDevice)
                        .epochDeviceMac(openFirstEpochBodyDTO.firstEpochMembershipProof().epochVirtualDeviceMac())
                        .build()
                )
                .sequenceID("0")
                .build();

        assertThat(epochRepository.findAll().getFirst())
                .usingRecursiveComparison()
                .ignoringFields(
                        "chatInbox.id",
                        "deviceEpochMembershipProofs.id",
                        "virtualDeviceEpochMembershipProof.id",
                        "virtualDeviceEpochMembershipProof.virtualDevice.chatInbox.id"
                )
                .isEqualTo(expectedEpochInDB);

        var expectedVirtualDeviceEncryptedRecoverySecrets = VirtualDeviceEncryptedRecoverySecrets.builder()
                .virtualDevice(expectedVirtualDevice)
                .epoch(expectedEpochInDB)
                .encryptedEpochSequenceID(openFirstEpochBodyDTO.virtualDeviceEncryptedRecoverySecrets().encryptedEpochSequenceID())
                .encryptedEpochStorageKeyPriv(openFirstEpochBodyDTO.virtualDeviceEncryptedRecoverySecrets().encryptedEpochStorageKeyPriv())
                .encryptedEpochRootKey(openFirstEpochBodyDTO.virtualDeviceEncryptedRecoverySecrets().encryptedEpochRootKey())
                .encryptedDeviceKeyPriv(openFirstEpochBodyDTO.virtualDeviceEncryptedRecoverySecrets().encryptedDeviceKeyPriv())
                .build();

        assertThat(virtualDeviceEncryptedRecoverySecretsRepository.findAll().getFirst())
                .usingRecursiveComparison()
                .ignoringFields(
                        "epoch.virtualDeviceEpochMembershipProof.id",
                        "epoch.deviceEpochMembershipProofs.id",
                        "id",
                        "virtualDevice.chatInbox.id"
                )
                .isEqualTo(expectedVirtualDeviceEncryptedRecoverySecrets);
    }
}