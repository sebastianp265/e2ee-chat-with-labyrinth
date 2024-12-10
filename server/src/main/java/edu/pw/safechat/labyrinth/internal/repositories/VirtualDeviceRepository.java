package edu.pw.safechat.labyrinth.internal.repositories;

import edu.pw.safechat.labyrinth.internal.entities.VirtualDevice;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VirtualDeviceRepository extends JpaRepository<VirtualDevice, byte[]> {

}
