import { OpenFirstEpochWebClient } from '@/lib/labyrinth/phases/open-first-epoch.ts';
import { JoinEpochWebClient } from '@/lib/labyrinth/phases/join-epoch.ts';
import { AuthenticateDeviceToEpochWebClient } from '@/lib/labyrinth/phases/authenticate-device-to-epoch.ts';
import { CheckIfLabyrinthIsInitializedWebClient } from '@/lib/labyrinth/Labyrinth.ts';
import { GetVirtualDeviceRecoverySecretsWebClient } from '@/lib/labyrinth/device/virtual-device/VirtualDevice.ts';
import { OpenNewEpochBasedOnCurrentWebClient } from '@/lib/labyrinth/phases/open-new-epoch-based-on-current.ts';
import { AuthenticateDeviceToEpochAndRegisterDeviceWebClient } from '@/lib/labyrinth/device/device.ts';

export type LabyrinthWebClient = OpenFirstEpochWebClient & // DONE 100%
    OpenNewEpochBasedOnCurrentWebClient &
    JoinEpochWebClient &
    GetVirtualDeviceRecoverySecretsWebClient &
    AuthenticateDeviceToEpochWebClient &
    CheckIfLabyrinthIsInitializedWebClient &
    AuthenticateDeviceToEpochAndRegisterDeviceWebClient;
