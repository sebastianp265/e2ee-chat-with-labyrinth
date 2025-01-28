import httpClient from '@/api/httpClient.ts';
import {
    OpenFirstEpochResponse,
    OpenFirstEpochServerClient,
} from '@/lib/labyrinth/phases/open-first-epoch.ts';
import {
    GetNewerEpochJoinDataResponse,
    GetNewestEpochSequenceIdResponse,
    GetOlderEpochJoinDataResponse,
    JoinEpochServerClient,
} from '@/lib/labyrinth/phases/join-epoch.ts';

import { AuthenticateDeviceToEpochServerClient } from '@/lib/labyrinth/phases/authenticate-device-to-epoch.ts';
import {
    AuthenticateDeviceToEpochAndRegisterDeviceRequestBody,
    AuthenticateDeviceToEpochAndRegisterDeviceResponse,
    AuthenticateDeviceToEpochAndRegisterDeviceServerClient,
} from '@/lib/labyrinth/device/device.ts';
import {
    CheckIfAnyDeviceExceedInactivityLimitResponseDTO,
    CheckIfAnyDeviceExceedInactivityLimitServerClient,
    CheckIfLabyrinthIsInitializedResponse,
    CheckIfLabyrinthIsInitializedServerClient,
    NotifyAboutDeviceActivityServerClient,
} from '@/lib/labyrinth/Labyrinth.ts';
import {
    GetVirtualDeviceRecoverySecretsResponse,
    GetVirtualDeviceRecoverySecretsServerClient,
} from '@/lib/labyrinth/device/virtual-device/VirtualDevice.ts';
import {
    GetDevicesInEpochResponse,
    OpenNewEpochBasedOnCurrentResponse,
    OpenNewEpochBasedOnCurrentServerClient,
} from '@/lib/labyrinth/phases/open-new-epoch-based-on-current.ts';
import { LabyrinthServerClient } from '@/lib/labyrinth/labyrinth-server-client.ts';

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
