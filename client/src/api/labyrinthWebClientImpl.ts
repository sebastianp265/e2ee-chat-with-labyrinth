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
    GetNewerEpochJoinData,
    GetNewestEpochSequenceIDResponse,
    GetOlderEpochJoinData,
    JoinEpochWebClient
} from "@/lib/labyrinth/epoch/join-epoch.ts";
import {
    GetVirtualDeviceRecoverySecretsResponse,
    GetVirtualDeviceRecoverySecretsWebClient
} from "@/lib/labyrinth/device/virtual-device.ts";
import {AuthenticateDeviceToEpochWebClient} from "@/lib/labyrinth/epoch/authenticate-device-to-epoch.ts";
import {UploadDevicePublicKeyBundleWebClient} from "@/lib/labyrinth/device/device.ts";

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
        (await axiosInstance.get<GetNewerEpochJoinData>(`api/labyrinth/epochs/by-sequence-id/${newerEpochSequenceID}/newer-epoch-join-data`)).data,

    getOlderEpochJoinData: async (olderEpochSequenceID) =>
        (await axiosInstance.get<GetOlderEpochJoinData>(`api/labyrinth/epochs/by-sequence-id/${olderEpochSequenceID}/older-epoch-join-data`)).data,

    getNewestEpochSequenceID: async () =>
        (await axiosInstance.get<GetNewestEpochSequenceIDResponse>(`api/labyrinth/epochs/newest-sequence-id`)).data,
}

const getVirtualDeviceRecoverySecretsWebClient: GetVirtualDeviceRecoverySecretsWebClient = {
    getVirtualDeviceRecoverySecrets: async (virtualDeviceID) =>
        (await axiosInstance.get<GetVirtualDeviceRecoverySecretsResponse>(`api/labyrinth/virtual-device/${virtualDeviceID}/recovery-secrets`)).data,
}

const authenticateDeviceToEpochWebClient: AuthenticateDeviceToEpochWebClient = {
    authenticateDeviceToEpoch: async (epochID, authenticateDeviceToEpochRequestBody) =>
        (await axiosInstance.post(`api/labyrinth/epochs/${epochID}/authenticate`, authenticateDeviceToEpochRequestBody)).data,
}

const uploadDevicePublicKeyBundleWebClient: UploadDevicePublicKeyBundleWebClient = {
    uploadDevicePublicKeyBundle: async (devicePublicKeyBundle) =>
        (await axiosInstance.post(`api/labyrinth/device/key-bundle`, devicePublicKeyBundle)).data,
}

const labyrinthWebClientImpl = {
    ...openFirstEpochWebClient,
    ...openNewEpochBasedOnCurrentWebClient,
    ...joinEpochWebClient,
    ...getVirtualDeviceRecoverySecretsWebClient,
    ...authenticateDeviceToEpochWebClient,
    ...uploadDevicePublicKeyBundleWebClient,
} as LabyrinthWebClient

export default labyrinthWebClientImpl