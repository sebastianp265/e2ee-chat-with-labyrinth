import {OpenFirstEpochWebClient, OpenNewEpochBasedOnCurrentWebClient} from "@/lib/labyrinth/epoch/open-new-epoch.ts";
import {JoinEpochWebClient} from "@/lib/labyrinth/epoch/join-epoch.ts";
import {GetVirtualDeviceRecoverySecretsWebClient} from "@/lib/labyrinth/device/virtual-device.ts";
import {AuthenticateDeviceToEpochWebClient} from "@/lib/labyrinth/epoch/authenticate-device-to-epoch.ts";
import {UploadDevicePublicKeyBundleWebClient} from "@/lib/labyrinth/device/device.ts";


export type LabyrinthWebClient =
    & OpenFirstEpochWebClient
    & OpenNewEpochBasedOnCurrentWebClient
    & JoinEpochWebClient
    & GetVirtualDeviceRecoverySecretsWebClient
    & AuthenticateDeviceToEpochWebClient
    & UploadDevicePublicKeyBundleWebClient