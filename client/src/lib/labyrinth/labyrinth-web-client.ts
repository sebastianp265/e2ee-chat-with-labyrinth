import {OpenFirstEpochWebClient, OpenNewEpochBasedOnCurrentWebClient} from "@/lib/labyrinth/epoch/open-new-epoch.ts";
import {JoinEpochWebClient} from "@/lib/labyrinth/epoch/join-epoch.ts";
import {GetVirtualDeviceRecoverySecretsWebClient} from "@/lib/labyrinth/device/virtual-device.ts";


export type LabyrinthWebClient =
    & OpenFirstEpochWebClient
    & OpenNewEpochBasedOnCurrentWebClient
    & JoinEpochWebClient
    & GetVirtualDeviceRecoverySecretsWebClient