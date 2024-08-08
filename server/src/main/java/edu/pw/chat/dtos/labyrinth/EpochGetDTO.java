package edu.pw.chat.dtos.labyrinth;

import edu.pw.chat.entitities.labyrinth.KeyBundle;
import lombok.Builder;
import lombok.Value;
import lombok.extern.jackson.Jacksonized;

import java.util.List;

@Value
@Builder
@Jacksonized
public class EpochGetDTO {

    String epochRootKey;
    Long epochSequenceID;
    String epochMetadata;

    List<KeyBundleDTO> keyBundles;
}
