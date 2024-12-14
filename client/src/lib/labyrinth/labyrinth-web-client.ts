import {OpenFirstEpochWebClient, OpenNewEpochBasedOnCurrentWebClient} from "@/lib/labyrinth/epoch/open-new-epoch.ts";
import {JoinEpochWebClient} from "@/lib/labyrinth/epoch/join-epoch.ts";
import {AuthenticateDeviceToEpochWebClient} from "@/lib/labyrinth/epoch/authenticate-device-to-epoch.ts";
import {UploadDevicePublicKeyBundleAndAuthenticateToEpochWebClient} from "@/lib/labyrinth/device/device.ts";
import {CheckIfLabyrinthIsInitializedWebClient} from "@/lib/labyrinth/Labyrinth.ts";
import {GetVirtualDeviceRecoverySecretsWebClient} from "@/lib/labyrinth/device/virtual-device/VirtualDevice.ts";


export type LabyrinthWebClient =
    & OpenFirstEpochWebClient
    & OpenNewEpochBasedOnCurrentWebClient
    & JoinEpochWebClient
    & GetVirtualDeviceRecoverySecretsWebClient
    & AuthenticateDeviceToEpochWebClient
    & UploadDevicePublicKeyBundleAndAuthenticateToEpochWebClient
    & CheckIfLabyrinthIsInitializedWebClient