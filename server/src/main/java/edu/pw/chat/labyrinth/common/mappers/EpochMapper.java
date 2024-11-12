package edu.pw.chat.labyrinth.common.mappers;

import edu.pw.chat.labyrinth.common.entities.Epoch;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper
public interface EpochMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "sequenceID", source = "sequenceID")
    Epoch toEntity(
            String sequenceID
    );
}
