package edu.pw.safechat.labyrinth.internal.services.common;

import edu.pw.safechat.labyrinth.dtos.common.VirtualDevicePublicKeyBundleDTO;
import edu.pw.safechat.labyrinth.internal.entities.Labyrinth;
import edu.pw.safechat.labyrinth.internal.entities.VirtualDevice;
import edu.pw.safechat.labyrinth.internal.mappers.VirtualDeviceMapper;
import edu.pw.safechat.labyrinth.internal.repositories.VirtualDeviceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Example;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class VirtualDeviceService {

    private final VirtualDeviceRepository virtualDeviceRepository;
    private final VirtualDeviceMapper virtualDeviceMapper;

    public VirtualDevice getVirtualDeviceByIdAndLabyrinth(byte[] virtualDeviceId, Labyrinth labyrinth) {
        Example<VirtualDevice> example = Example.of(VirtualDevice.builder()
                .id(virtualDeviceId)
                .labyrinth(labyrinth)
                .build()
        );

        return virtualDeviceRepository.findOne(example)
                .orElseThrow();
    }

//    public VirtualDevice getVirtualDeviceByLabyrinth(Labyrinth labyrinth) {
//        Example<VirtualDevice> example = Example.of(VirtualDevice.builder()
//                .labyrinth(labyrinth)
//                .build()
//        );
//
//        return virtualDeviceRepository.findOne(example)
//                .orElseThrow();
//    }

    public VirtualDevice createAndSave(
            byte[] id,
            VirtualDevicePublicKeyBundleDTO virtualDevicePublicKeyBundleDTO,
            Labyrinth labyrinth
    ) {
        return virtualDeviceRepository.save(
                virtualDeviceMapper.toEntity(
                        id,
                        virtualDevicePublicKeyBundleDTO,
                        labyrinth
                )
        );
    }

}
