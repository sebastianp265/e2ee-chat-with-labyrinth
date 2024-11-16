package edu.pw.chat.labyrinth.common.mappers;

import edu.pw.chat.labyrinth.common.entities.*;
import org.junit.jupiter.api.Test;
import org.mapstruct.factory.Mappers;

import java.util.List;
import java.util.UUID;

import static edu.pw.chat.utils.TestUtils.*;
import static org.assertj.core.api.Assertions.assertThat;

class EpochMapperTest {

    private final EpochMapper epochMapper = Mappers.getMapper(EpochMapper.class);

    @Test
    void shouldMapToEpochEntityGivenRequiredEntitiesWithAllFields() {
        // given
        ChatInbox chatInbox = ChatInbox.builder()
                .id(UUID.randomUUID())
                .userID(UUID.randomUUID())
                .build();

        Device device1 = Device.builder()
                .id(UUID.randomUUID())
                .deviceKeyPub(get32RandomBytes())

                .epochStorageKeyPub(get32RandomBytes())
                .epochStorageKeySig(get32RandomBytes())

                .epochStorageAuthKeyPub(get32RandomBytes())
                .epochStorageAuthKeySig(get32RandomBytes())
                .build();

        Device device2 = Device.builder()
                .id(UUID.randomUUID())
                .deviceKeyPub(get32RandomBytes())

                .epochStorageKeyPub(get32RandomBytes())
                .epochStorageKeySig(get32RandomBytes())

                .epochStorageAuthKeyPub(get32RandomBytes())
                .epochStorageAuthKeySig(get32RandomBytes())
                .build();

        List<DeviceEpochMembershipProof> deviceEpochMembershipProofs = List.of(
                DeviceEpochMembershipProof.builder()
                        .id(getRandomLong())
                        .device(device1)
                        .epochDeviceMac(get32RandomBytes())
                        .build(),
                DeviceEpochMembershipProof.builder()
                        .id(getRandomLong())
                        .device(device2)
                        .epochDeviceMac(get32RandomBytes())
                        .build()
        );

        VirtualDevice virtualDevice = VirtualDevice.builder()
                .id(get40RandomCharactersString())

                .deviceKeyPub(get32RandomBytes())

                .epochStorageKeyPub(get32RandomBytes())
                .epochStorageKeySig(get32RandomBytes())
                .build();

        VirtualDeviceEpochMembershipProof virtualDeviceEpochMembershipProof =
                VirtualDeviceEpochMembershipProof.builder()
                        .id(getRandomLong())
                        .virtualDevice(virtualDevice)
                        .epochDeviceMac(get32RandomBytes())
                        .build();

        String sequenceID = get40RandomCharactersString();

        // when
        Epoch actualEpoch = epochMapper.toEntity(
                chatInbox,
                deviceEpochMembershipProofs,
                virtualDeviceEpochMembershipProof,
                sequenceID
        );

        // then
        Epoch expectedEpoch = Epoch.builder()
                .id(null)
                .chatInbox(chatInbox)
                .deviceEpochMembershipProofs(deviceEpochMembershipProofs)
                .virtualDeviceEpochMembershipProof(virtualDeviceEpochMembershipProof)
                .sequenceID(sequenceID)
                .build();
        
        assertThat(actualEpoch)
                .usingRecursiveComparison()
                .isEqualTo(expectedEpoch);
    }
}
