package edu.pw.chat.dtos.labyrinth;

import lombok.Builder;
import lombok.Value;
import lombok.extern.jackson.Jacksonized;

@Value
@Builder
@Jacksonized
public class KeyBundleDTO {
    String deviceKeyPub;

    String epochStorageKeyPub;
    String epochStorageKeySig;

    String epochStorageAuthKeyPub;
    String epochStorageAuthKeySig;

    String epochDeviceMac;
}
