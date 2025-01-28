package edu.pw.safechat.labyrinth.internal.repositories;

import edu.pw.safechat.labyrinth.internal.entities.Device;
import edu.pw.safechat.labyrinth.internal.entities.Labyrinth;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.time.Instant;
import java.util.UUID;

public interface DeviceRepository extends JpaRepository<Device, UUID> {

    @Modifying
    @Query("update Device d set d.lastActiveAt = ?2 where d.id = ?1")
    void updateLastActiveAtById(UUID id, Instant lastActiveAt);

    boolean existsByLabyrinthAndLastActiveAtLessThan(Labyrinth labyrinth, Instant lastActiveAt);

}
