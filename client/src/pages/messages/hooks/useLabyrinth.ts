import {LABYRINTH_INSTANCE_KEY} from "@/constants.ts";
import {Labyrinth, LabyrinthSerialized} from "@/lib/labyrinth/Labyrinth.ts";
import labyrinthWebClientImpl from "@/api/labyrinthWebClientImpl.ts";
import {useEffect, useMemo, useState} from "react";
import {
    HandleSubmitRecoveryCodeResponse
} from "@/components/app/welcome-to-labyrinth/RecoverSecretsDialogContentChildren.tsx";
import {
    HandleGenerateRecoveryCodeResponse
} from "@/components/app/welcome-to-labyrinth/GenerateRecoveryCodeAlertDialogContentChildren.tsx";
import {AxiosError} from "axios";

export enum LabyrinthLoadState {
    LOADING,
    NOT_INITIALIZED,
    NOT_IN_STORAGE_AND_FIRST_EPOCH_NOT_CREATED,
    NOT_IN_STORAGE_AND_HAS_RECOVERY_CODE,
}

function loadLabyrinthFromLocalStorage(): LabyrinthSerialized | null {
    const labyrinthJSONString = localStorage.getItem(LABYRINTH_INSTANCE_KEY)
    if (labyrinthJSONString === null) {
        return null
    }

    // TODO: Validate with zod?
    return JSON.parse(labyrinthJSONString)
}

function saveLabyrinthToLocalStorage(labyrinth: Labyrinth) {
    localStorage.setItem(LABYRINTH_INSTANCE_KEY, JSON.stringify(labyrinth.serialize()))
}

export default function useLabyrinth(loggedUserId: string) {
    const labyrinthSerialized = useMemo(() => loadLabyrinthFromLocalStorage(), []);
    const [initialLoadState, setInitialLoadState] = useState(
        labyrinthSerialized === null ?
            LabyrinthLoadState.NOT_INITIALIZED :
            LabyrinthLoadState.LOADING
    )

    const [labyrinth, setLabyrinth] = useState<Labyrinth | null>(null);
    const [error, setError] = useState<AxiosError | null>(null)

    useEffect(() => {
        if (initialLoadState === LabyrinthLoadState.NOT_INITIALIZED) {
            Labyrinth.checkIfLabyrinthIsInitialized(labyrinthWebClientImpl)
                .then(response => {
                    const loadState = response.isInitialized ?
                        LabyrinthLoadState.NOT_IN_STORAGE_AND_HAS_RECOVERY_CODE :
                        LabyrinthLoadState.NOT_IN_STORAGE_AND_FIRST_EPOCH_NOT_CREATED
                    setInitialLoadState(loadState)
                })
        } else if (initialLoadState === LabyrinthLoadState.LOADING) {
            Labyrinth.deserialize(labyrinthSerialized!, labyrinthWebClientImpl)
                .then(setLabyrinth)
        }
    }, [initialLoadState, labyrinthSerialized]);

    useEffect(() => {
        if (labyrinth !== null) {
            saveLabyrinthToLocalStorage(labyrinth)
        }
    }, [labyrinth]);


    async function setLabyrinthFromRecoveryCode(recoveryCode: string): Promise<HandleSubmitRecoveryCodeResponse> {
        setLabyrinth(await Labyrinth.fromRecoveryCode(loggedUserId, recoveryCode, labyrinthWebClientImpl))
        return {
            isSuccess: true,
        }
    }

    async function setLabyrinthFromFirstEpoch(): Promise<HandleGenerateRecoveryCodeResponse> {
        const fromFirstEpoch = await Labyrinth.fromFirstEpoch(loggedUserId, labyrinthWebClientImpl)
        setLabyrinth(fromFirstEpoch.labyrinthInstance)

        return {
            recoveryCode: fromFirstEpoch.recoveryCode,
        }
    }

    async function retryInitialization() {
        setInitialLoadState(LabyrinthLoadState.NOT_INITIALIZED)
    }

    return {
        labyrinth,
        initialLoadState,
        error,
        retryInitialization,
        setLabyrinthFromRecoveryCode,
        setLabyrinthFromFirstEpoch
    } as const;
}