package edu.pw.chat.dtos.labyrinth;

import lombok.Builder;
import lombok.Value;
import lombok.extern.jackson.Jacksonized;

@Value
@Builder
@Jacksonized
public class EpochCreateDTO {

    String epochRootKey;
    KeyBundleDTO keyBundle;

}
