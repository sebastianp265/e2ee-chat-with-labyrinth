import {EPOCH_STORAGE_KEY} from "@/constants.ts";
import {EpochStorage} from "@/lib/labyrinth/epoch/EpochStorage.ts";
import {useEffect, useReducer} from "react";
import {Epoch} from "@/lib/labyrinth/labyrinth-types.ts";

function loadEpochStorageFromLocalStorage() {
    const epochStorageJSONString = localStorage.getItem(EPOCH_STORAGE_KEY)
    return epochStorageJSONString !== null ? JSON.parse(epochStorageJSONString) as EpochStorage : undefined
}


function saveEpochStorageToLocalStorage(epochStorage: EpochStorage | undefined) {
    if (epochStorage === undefined) {
        localStorage.removeItem(EPOCH_STORAGE_KEY)
    } else {
        localStorage.setItem(EPOCH_STORAGE_KEY, JSON.stringify(epochStorage))
    }
}

type Action = {
    payload: Epoch,
    type: 'append' | 'prepend'
}

function epochReducer(state: EpochStorage | undefined, action: Action) {
    if (state === undefined) return undefined
    const newState = state.shallowCopy()
    switch (action.type) {
        case "append":
            newState.addNewerEpoch(action.payload)
            break
        case "prepend":
            newState.addOlderEpoch(action.payload)
            break
    }

    return newState
}

export default function useEpochStorage() {
    const [epochStorage, updateEpochStorage] = useReducer(epochReducer, loadEpochStorageFromLocalStorage())

    useEffect(() => {
        saveEpochStorageToLocalStorage(epochStorage)
    }, [epochStorage])

    return {epochStorage, updateEpochStorage} as const
}
