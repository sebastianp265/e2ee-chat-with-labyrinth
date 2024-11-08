import {LABYRINTH_INSTANCE_KEY} from "@/constants.ts";
import {Labyrinth, LabyrinthSerialized} from "@/lib/labyrinth/Labyrinth.ts";
import labyrinthWebClientImpl from "@/api/labyrinthWebClientImpl.ts";
import {useEffect, useState} from "react";
import axiosInstance from "@/api/axios/axiosInstance.ts";
import {HandleSubmitRecoveryCodeResponse} from "@/components/app/welcome-to-labyrinth/RecoverSecretsDialogContentChildren.tsx";
import {
    HandleGenerateRecoveryCodeResponse
} from "@/components/app/welcome-to-labyrinth/GenerateRecoveryCodeAlertDialogContentChildren.tsx";
import {AxiosError} from "axios";

export enum LabyrinthLoadState {
    NOT_INITIALIZED,
    NOT_IN_STORAGE_AND_FIRST_EPOCH_NOT_CREATED,
    NOT_IN_STORAGE_AND_HAS_RECOVERY_CODE,
}

export function isLabyrinthLoadState(value: unknown): value is LabyrinthLoadState {
    return Object.values(LabyrinthLoadState).includes(value as LabyrinthLoadState);
}

async function loadLabyrinthFromLocalStorage() {
    const labyrinthJSONString = localStorage.getItem(LABYRINTH_INSTANCE_KEY)
    if (labyrinthJSONString === null) {
        return null
    }

    const labyrinthSerialized: LabyrinthSerialized = JSON.parse(labyrinthJSONString)

    return await Labyrinth.deserialize(labyrinthSerialized, labyrinthWebClientImpl)
}

export default function useLabyrinth(loggedUserID: string) {
    const [labyrinthOrLoadState, setLabyrinthOrLoadState] = useState<Labyrinth | LabyrinthLoadState>(LabyrinthLoadState.NOT_INITIALIZED);
    const [error, setError] = useState<AxiosError | null>(null)

    async function initializeLabyrinth() {
        const labyrinthInstance = await loadLabyrinthFromLocalStorage()
        if (labyrinthInstance === null) {
            const hasRecoveryCode = (await axiosInstance.get<boolean>(`api/labyrinth/has-recovery-code`)).data
            if (hasRecoveryCode) {
                return LabyrinthLoadState.NOT_IN_STORAGE_AND_HAS_RECOVERY_CODE
            } else {
                return LabyrinthLoadState.NOT_IN_STORAGE_AND_FIRST_EPOCH_NOT_CREATED
            }
        }
        return labyrinthInstance
    }

    useEffect(() => {
        initializeLabyrinth()
            .then(setLabyrinthOrLoadState)
            .catch(setError)
    }, [setError]);

    async function setLabyrinthFromRecoveryCode(recoveryCode: string): Promise<HandleSubmitRecoveryCodeResponse> {
        setLabyrinthOrLoadState(await Labyrinth.fromRecoveryCode(loggedUserID, recoveryCode, labyrinthWebClientImpl))
        return {
            isSuccess: true,
        }
    }

    async function setLabyrinthFromFirstEpoch(): Promise<HandleGenerateRecoveryCodeResponse> {
        const fromFirstEpoch = await Labyrinth.fromFirstEpoch(loggedUserID, labyrinthWebClientImpl)
        setLabyrinthOrLoadState(fromFirstEpoch.labyrinthInstance)

        return {
            recoveryCode: fromFirstEpoch.recoveryCode,
        }
    }

    async function retryInitialization() {
        setError(null)
        initializeLabyrinth()
            .then(setLabyrinthOrLoadState)
            .catch(setError)
    }

    return {labyrinthOrLoadState, error, retryInitialization, setLabyrinthFromRecoveryCode, setLabyrinthFromFirstEpoch} as const;
}