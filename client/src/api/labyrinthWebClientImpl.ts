import axiosInstance from "@/api/axios/axiosInstance.ts";
import {LabyrinthWebClient} from "@/lib/labyrinth/labyrinth-web-client.ts";
import {
    GetDevicesInEpochResponse,
    OpenFirstEpochResponse,
    OpenFirstEpochWebClient,
    OpenNewEpochBasedOnCurrentResponse,
    OpenNewEpochBasedOnCurrentWebClient
} from "@/lib/labyrinth/epoch/open-new-epoch.ts";
import {
    GetNewerEpochJoinDataResponse,
    GetNewestEpochSequenceIDResponse,
    GetOlderEpochJoinDataResponse,
    JoinEpochWebClient
} from "@/lib/labyrinth/epoch/join-epoch.ts";

import {AuthenticateDeviceToEpochWebClient} from "@/lib/labyrinth/epoch/authenticate-device-to-epoch.ts";
import {UploadDevicePublicKeyBundleWebClient} from "@/lib/labyrinth/device/device.ts";
import {
    CheckIfLabyrinthIsInitializedResponse,
    CheckIfLabyrinthIsInitializedWebClient
} from "@/lib/labyrinth/Labyrinth.ts";
import {
    GetVirtualDeviceRecoverySecretsResponse,
    GetVirtualDeviceRecoverySecretsWebClient
} from "@/lib/labyrinth/device/virtual-device/VirtualDevice.ts";

const openFirstEpochWebClient: OpenFirstEpochWebClient = {
    openFirstEpoch: async (requestBody) =>
        (await axiosInstance.post<OpenFirstEpochResponse>(`api/labyrinth/epochs/open-first`, requestBody)).data,
}

const openNewEpochBasedOnCurrentWebClient: OpenNewEpochBasedOnCurrentWebClient = {
    getDevicesInEpoch: async (epochID) =>
        (await axiosInstance.get<GetDevicesInEpochResponse>(`api/labyrinth/epochs/${epochID}/devices`)).data,

    openNewEpochBasedOnCurrent: async (currentEpochID, requestBody) =>
        (await axiosInstance.post<OpenNewEpochBasedOnCurrentResponse>(`api/labyrinth/epochs/open-based-on-current/${currentEpochID}`, requestBody)).data,
}

const joinEpochWebClient: JoinEpochWebClient = {
    getNewerEpochJoinData: async (newerEpochSequenceID) =>
        (await axiosInstance.get<GetNewerEpochJoinDataResponse>(`api/labyrinth/epochs/by-sequence-id/${newerEpochSequenceID}/newer-epoch-join-data`)).data,

    getOlderEpochJoinData: async (olderEpochSequenceID) =>
        (await axiosInstance.get<GetOlderEpochJoinDataResponse>(`api/labyrinth/epochs/by-sequence-id/${olderEpochSequenceID}/older-epoch-join-data`)).data,

    getNewestEpochSequenceID: async () =>
        (await axiosInstance.get<GetNewestEpochSequenceIDResponse>(`api/labyrinth/epochs/newest-sequence-id`)).data,
}

const getVirtualDeviceRecoverySecretsWebClient: GetVirtualDeviceRecoverySecretsWebClient = {
    getVirtualDeviceRecoverySecrets: async (getVirtualDeviceRecoverySecretsBody) =>
        (await axiosInstance.post<GetVirtualDeviceRecoverySecretsResponse>(
                `api/labyrinth/virtual-device/recovery-secrets`,
                getVirtualDeviceRecoverySecretsBody)
        ).data,
}

const authenticateDeviceToEpochWebClient: AuthenticateDeviceToEpochWebClient = {
    authenticateDeviceToEpoch: async (epochID, authenticateDeviceToEpochRequestBody) =>
        (await axiosInstance.post(`api/labyrinth/epochs/${epochID}/authenticate`, authenticateDeviceToEpochRequestBody)).data,
}

const uploadDevicePublicKeyBundleWebClient: UploadDevicePublicKeyBundleWebClient = {
    uploadDevicePublicKeyBundle: async (devicePublicKeyBundle) =>
        (await axiosInstance.post(`api/labyrinth/device/key-bundle`, devicePublicKeyBundle)).data,
}

const checkIfLabyrinthIsInitializedWebClient: CheckIfLabyrinthIsInitializedWebClient = {
    checkIfLabyrinthIsInitialized: async () =>
        (await axiosInstance.get<CheckIfLabyrinthIsInitializedResponse>("api/labyrinth/is-initialized")).data
}

const labyrinthWebClientImpl = {
    ...openFirstEpochWebClient,
    ...openNewEpochBasedOnCurrentWebClient,
    ...joinEpochWebClient,
    ...getVirtualDeviceRecoverySecretsWebClient,
    ...authenticateDeviceToEpochWebClient,
    ...uploadDevicePublicKeyBundleWebClient,
    ...checkIfLabyrinthIsInitializedWebClient
} as LabyrinthWebClient

export default labyrinthWebClientImpl