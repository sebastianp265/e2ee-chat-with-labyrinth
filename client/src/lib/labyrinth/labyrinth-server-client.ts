import { OpenFirstEpochServerClient } from '@/lib/labyrinth/phases/open-first-epoch.ts';
import { JoinEpochServerClient } from '@/lib/labyrinth/phases/join-epoch.ts';
import { AuthenticateDeviceToEpochServerClient } from '@/lib/labyrinth/phases/authenticate-device-to-epoch.ts';
import {
    CheckIfAnyDeviceExceedInactivityLimitServerClient,
    CheckIfLabyrinthIsInitializedServerClient,
    NotifyAboutDeviceActivityServerClient,
} from '@/lib/labyrinth/Labyrinth.ts';
import { GetVirtualDeviceRecoverySecretsServerClient } from '@/lib/labyrinth/device/virtual-device/VirtualDevice.ts';
import { OpenNewEpochBasedOnCurrentServerClient } from '@/lib/labyrinth/phases/open-new-epoch-based-on-current.ts';
import { AuthenticateDeviceToEpochAndRegisterDeviceServerClient } from '@/lib/labyrinth/device/device.ts';

export type LabyrinthServerClient = OpenFirstEpochServerClient &
    OpenNewEpochBasedOnCurrentServerClient &
    JoinEpochServerClient &
    GetVirtualDeviceRecoverySecretsServerClient &
    AuthenticateDeviceToEpochServerClient &
    CheckIfLabyrinthIsInitializedServerClient &
    AuthenticateDeviceToEpochAndRegisterDeviceServerClient &
    NotifyAboutDeviceActivityServerClient &
    CheckIfAnyDeviceExceedInactivityLimitServerClient;
