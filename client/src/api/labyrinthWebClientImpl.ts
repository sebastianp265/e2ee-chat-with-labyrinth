import httpClient from '@/api/httpClient.ts';
import { LabyrinthWebClient } from '@/lib/labyrinth/labyrinth-web-client.ts';
import {
    GetDevicesInEpochResponse,
    OpenFirstEpochResponse,
    OpenFirstEpochWebClient,
    OpenNewEpochBasedOnCurrentResponse,
    OpenNewEpochBasedOnCurrentWebClient,
} from '@/lib/labyrinth/epoch/open-new-epoch.ts';
import {
    GetNewerEpochJoinDataResponse,
    GetNewestEpochSequenceIdResponse,
    GetOlderEpochJoinDataResponse,
    JoinEpochWebClient,
} from '@/lib/labyrinth/epoch/join-epoch.ts';

import { AuthenticateDeviceToEpochWebClient } from '@/lib/labyrinth/epoch/authenticate-device-to-epoch.ts';
import {
    AuthenticateDeviceToEpochAndRegisterDeviceRequestBody,
    AuthenticateDeviceToEpochAndRegisterDeviceResponse,
    AuthenticateDeviceToEpochAndRegisterDeviceWebClient,
} from '@/lib/labyrinth/device/device.ts';
import {
    CheckIfLabyrinthIsInitializedResponse,
    CheckIfLabyrinthIsInitializedWebClient,
} from '@/lib/labyrinth/Labyrinth.ts';
import {
    GetVirtualDeviceRecoverySecretsResponse,
    GetVirtualDeviceRecoverySecretsWebClient,
} from '@/lib/labyrinth/device/virtual-device/VirtualDevice.ts';

const labyrinthServicePrefix = '/api/labyrinth-service';

const openFirstEpochWebClient: OpenFirstEpochWebClient = {
    openFirstEpoch: async (requestBody) =>
        (
            await httpClient.post<OpenFirstEpochResponse>(
                `${labyrinthServicePrefix}/epochs/open-first`,
                requestBody,
            )
        ).data,
};

const openNewEpochBasedOnCurrentWebClient: OpenNewEpochBasedOnCurrentWebClient =
    {
        getDevicesInEpoch: async (epochId) =>
            (
                await httpClient.get<GetDevicesInEpochResponse>(
                    `${labyrinthServicePrefix}/epochs/${epochId}/devices`,
                )
            ).data,

        openNewEpochBasedOnCurrent: async (currentEpochId, requestBody) =>
            (
                await httpClient.post<OpenNewEpochBasedOnCurrentResponse>(
                    `${labyrinthServicePrefix}/epochs/open-based-on-current/${currentEpochId}`,
                    requestBody,
                )
            ).data,
    };

const joinEpochWebClient: JoinEpochWebClient = {
    getNewerEpochJoinData: async (newerEpochSequenceId) =>
        (
            await httpClient.get<GetNewerEpochJoinDataResponse>(
                `${labyrinthServicePrefix}/epochs/by-sequence-id/${newerEpochSequenceId}/newer-epoch-join-data`,
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

const getVirtualDeviceRecoverySecretsWebClient: GetVirtualDeviceRecoverySecretsWebClient =
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

const authenticateDeviceToEpochWebClient: AuthenticateDeviceToEpochWebClient = {
    authenticateDeviceToEpoch: async (
        epochId,
        authenticateDeviceToEpochRequestBody,
    ) =>
        (
            await httpClient.post<void>(
                `${labyrinthServicePrefix}/epochs/${epochId}/authenticate`,
                authenticateDeviceToEpochRequestBody,
            )
        ).data,
};

const authenticateDeviceToEpochAndRegisterDeviceWebClient: AuthenticateDeviceToEpochAndRegisterDeviceWebClient =
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

const checkIfLabyrinthIsInitializedWebClient: CheckIfLabyrinthIsInitializedWebClient =
    {
        checkIfLabyrinthIsInitialized: async () =>
            (
                await httpClient.get<CheckIfLabyrinthIsInitializedResponse>(
                    `${labyrinthServicePrefix}/is-initialized`,
                )
            ).data,
    };

const labyrinthWebClientImpl = {
    ...openFirstEpochWebClient,
    ...openNewEpochBasedOnCurrentWebClient,
    ...joinEpochWebClient,
    ...getVirtualDeviceRecoverySecretsWebClient,
    ...authenticateDeviceToEpochWebClient,
    ...authenticateDeviceToEpochAndRegisterDeviceWebClient,
    ...checkIfLabyrinthIsInitializedWebClient,
} as LabyrinthWebClient;

export default labyrinthWebClientImpl;
