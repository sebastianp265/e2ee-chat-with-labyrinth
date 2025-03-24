import httpClient from '@/api/httpClient.ts';
import {
    GetVirtualDeviceRecoverySecretsResponse,
    GetVirtualDeviceRecoverySecretsServerClient,
} from '@sebastianp265/safe-server-side-storage-client/device/virtual-device/VirtualDevice';
import {
    GetNewerEpochJoinDataResponse,
    GetNewestEpochSequenceIdResponse,
    GetOlderEpochJoinDataResponse,
    JoinEpochServerClient,
} from '@sebastianp265/safe-server-side-storage-client/phases/join-epoch';
import {
    OpenFirstEpochResponse,
    OpenFirstEpochServerClient,
} from '@sebastianp265/safe-server-side-storage-client/phases/open-first-epoch';
import {
    GetDevicesInEpochResponse,
    OpenNewEpochBasedOnCurrentResponse,
    OpenNewEpochBasedOnCurrentServerClient,
} from '@sebastianp265/safe-server-side-storage-client/phases/open-new-epoch-based-on-current';
import { AuthenticateDeviceToEpochServerClient } from '@sebastianp265/safe-server-side-storage-client/phases/authenticate-device-to-epoch';
import {
    AuthenticateDeviceToEpochAndRegisterDeviceRequestBody,
    AuthenticateDeviceToEpochAndRegisterDeviceResponse,
    AuthenticateDeviceToEpochAndRegisterDeviceServerClient,
} from '@sebastianp265/safe-server-side-storage-client/device/ThisDevice';
import {
    CheckIfAnyDeviceExceedInactivityLimitResponseDTO,
    CheckIfAnyDeviceExceedInactivityLimitServerClient,
    CheckIfLabyrinthIsInitializedResponse,
    CheckIfLabyrinthIsInitializedServerClient,
    LabyrinthServerClient,
    NotifyAboutDeviceActivityServerClient,
} from '@sebastianp265/safe-server-side-storage-client';

const labyrinthServicePrefix = '/api/labyrinth-service';

const openFirstEpochServerClient: OpenFirstEpochServerClient = {
    openFirstEpoch: async (requestBody) =>
        (
            await httpClient.post<OpenFirstEpochResponse>(
                `${labyrinthServicePrefix}/epochs/open-first`,
                requestBody,
            )
        ).data,
};

const openNewEpochBasedOnCurrentServerClient: OpenNewEpochBasedOnCurrentServerClient =
    {
        getDevicesInEpoch: async (epochId) =>
            (
                await httpClient.get<GetDevicesInEpochResponse>(
                    `${labyrinthServicePrefix}/epochs/${epochId}/devices`,
                )
            ).data,

        openNewEpochBasedOnCurrent: async (
            currentEpochId,
            thisDeviceId,
            requestBody,
        ) =>
            (
                await httpClient.post<OpenNewEpochBasedOnCurrentResponse>(
                    `${labyrinthServicePrefix}/epochs/open-based-on-current/${currentEpochId}/by-device/${thisDeviceId}`,
                    requestBody,
                )
            ).data,
    };

const joinEpochServerClient: JoinEpochServerClient = {
    getNewerEpochJoinDataForDevice: async (newerEpochSequenceId, deviceId) =>
        (
            await httpClient.get<GetNewerEpochJoinDataResponse>(
                `${labyrinthServicePrefix}/epochs/by-sequence-id/${newerEpochSequenceId}/newer-epoch-join-data/for-device/${deviceId}`,
            )
        ).data,

    getNewerEpochJoinDataForVirtualDevice: async (
        newerEpochSequenceId: string,
    ) =>
        (
            await httpClient.get<GetNewerEpochJoinDataResponse>(
                `${labyrinthServicePrefix}/epochs/by-sequence-id/${newerEpochSequenceId}/newer-epoch-join-data/for-virtual-device`,
            )
        ).data,

    getOlderEpochJoinData: async (olderEpochSequenceId) =>
        (
            await httpClient.get<GetOlderEpochJoinDataResponse>(
                `${labyrinthServicePrefix}/epochs/by-sequence-id/${olderEpochSequenceId}/older-epoch-join-data`,
            )
        ).data,

    getNewestEpochSequenceId: async () =>
        (
            await httpClient.get<GetNewestEpochSequenceIdResponse>(
                `${labyrinthServicePrefix}/epochs/newest-sequence-id`,
            )
        ).data,
};

const getVirtualDeviceRecoverySecretsServerClient: GetVirtualDeviceRecoverySecretsServerClient =
    {
        getVirtualDeviceRecoverySecrets: async (
            getVirtualDeviceRecoverySecretsBody,
        ) =>
            (
                await httpClient.post<GetVirtualDeviceRecoverySecretsResponse>(
                    `${labyrinthServicePrefix}/virtual-device/recovery-secrets`,
                    getVirtualDeviceRecoverySecretsBody,
                )
            ).data,
    };

const authenticateDeviceToEpochServerClient: AuthenticateDeviceToEpochServerClient =
    {
        authenticateDeviceToEpoch: async (
            epochId,
            deviceId,
            authenticateDeviceToEpochRequestBody,
        ) =>
            (
                await httpClient.post<void>(
                    `${labyrinthServicePrefix}/epochs/${epochId}/devices/${deviceId}/authenticate`,
                    authenticateDeviceToEpochRequestBody,
                )
            ).data,
    };

const authenticateDeviceToEpochAndRegisterDeviceServerClient: AuthenticateDeviceToEpochAndRegisterDeviceServerClient =
    {
        authenticateDeviceToEpochAndRegisterDevice: async (
            epochId: string,
            requestBody: AuthenticateDeviceToEpochAndRegisterDeviceRequestBody,
        ) =>
            (
                await httpClient.post<AuthenticateDeviceToEpochAndRegisterDeviceResponse>(
                    `${labyrinthServicePrefix}/epochs/${epochId}/authenticate-and-register-device`,
                    requestBody,
                )
            ).data,
    };

const checkIfLabyrinthIsInitializedServerClient: CheckIfLabyrinthIsInitializedServerClient =
    {
        checkIfLabyrinthIsInitialized: async () =>
            (
                await httpClient.get<CheckIfLabyrinthIsInitializedResponse>(
                    `${labyrinthServicePrefix}/is-initialized`,
                )
            ).data,
    };

const notifyAboutDeviceActivityServerClient: NotifyAboutDeviceActivityServerClient =
    {
        notifyAboutDeviceActivity: async (deviceId) =>
            (
                await httpClient.post<void>(
                    `${labyrinthServicePrefix}/devices/${deviceId}/notify-activity`,
                )
            ).data,
    };

const checkIfAnyDeviceExceedInactivityLimitServerClient: CheckIfAnyDeviceExceedInactivityLimitServerClient =
    {
        checkIfAnyDeviceExceedInactivityLimit: async () =>
            (
                await httpClient.get<CheckIfAnyDeviceExceedInactivityLimitResponseDTO>(
                    `${labyrinthServicePrefix}/did-any-device-exceed-inactivity-limit`,
                )
            ).data,
    };

const labyrinthWebClientImpl = {
    ...openFirstEpochServerClient,
    ...openNewEpochBasedOnCurrentServerClient,
    ...joinEpochServerClient,
    ...getVirtualDeviceRecoverySecretsServerClient,
    ...authenticateDeviceToEpochServerClient,
    ...authenticateDeviceToEpochAndRegisterDeviceServerClient,
    ...checkIfLabyrinthIsInitializedServerClient,
    ...notifyAboutDeviceActivityServerClient,
    ...checkIfAnyDeviceExceedInactivityLimitServerClient,
} as LabyrinthServerClient;

export default labyrinthWebClientImpl;
