package edu.pw.chat.mappers;

import edu.pw.chat.dtos.labyrinth.EpochGetDTO;
import edu.pw.chat.entitities.labyrinth.Epoch;
import edu.pw.chat.entitities.labyrinth.KeyBundle;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.springframework.stereotype.Component;

@Component
@Mapper
public interface EpochMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "epochSequenceID", constant = "0L")
    @Mapping(target = "epochMetadata", ignore = true)
    @Mapping(target = "keyBundles", expression = "java(List.of(keyBundle))")
    Epoch toEpoch(String epochRootKey, KeyBundle keyBundle);

    EpochGetDTO toEpochGetDTO(Epoch epoch);
}
