import {
    DeviceIDToEncryptedEpochEntropyMap,
    EpochJoinData,
    EpochRecoveryData,
    LabyrinthWebClient,
    PublicDevice
} from "@/lib/labyrinth/labyrinth-types.ts";
import axiosAPI from "@/api/axiosAPI.ts";

async function uploadEpochJoinData(newEpochSequenceID: string,
                                   deviceIDToEncryptedEpochEntropyMap: DeviceIDToEncryptedEpochEntropyMap): Promise<string> {
    const response = await axiosAPI.post<string>(`api/labyrinth/epoch/by-sequence-id/${newEpochSequenceID}/join-data`, deviceIDToEncryptedEpochEntropyMap)
    return response.data
}

async function uploadAuthenticationData(epochID: string,
                                        epochDeviceMac: Buffer): Promise<void> {
    await axiosAPI.post<void>(`api/labyrinth/epoch/${epochID}/authenticate`, epochDeviceMac)
}

async function uploadEpochRecoveryData(epochRecoveryData: EpochRecoveryData): Promise<void> {
    await axiosAPI.post<void>(`api/labyrinth/epoch/recovery-data`, epochRecoveryData)
}

async function getDevicesInEpoch(epochID: string): Promise<PublicDevice[]> {
    const response = await axiosAPI.get<PublicDevice[]>(`api/labyrinth/epoch/${epochID}/devices`)
    return response.data
}

async function getEpochJoinData(epochSequenceID: string): Promise<EpochJoinData> {
    const response = await axiosAPI.get<EpochJoinData>(`api/labyrinth/epoch/by-sequence-id/${epochSequenceID}/join-data`)
    return response.data
}

async function getEpochRecoveryData(epochSequenceID: string): Promise<EpochRecoveryData> {
    const response = await axiosAPI.get<EpochRecoveryData>(`api/labyrinth/epoch/by-sequence-id/${epochSequenceID}/recovery-data`)
    return response.data
}

const labyrinthWebClientImpl = {
    uploadEpochRecoveryData,
    getEpochRecoveryData,
    getDevicesInEpoch,
    getEpochJoinData,
    uploadAuthenticationData,
    uploadEpochJoinData
} as LabyrinthWebClient

export default labyrinthWebClientImpl