import {EPOCH_STORAGE_KEY} from "@/constants.ts";
import {EpochStorage} from "@/lib/labyrinth/epoch/EpochStorage.ts";
import {useState} from "react";

function loadEpochStorageFromLocalStorage() {
    const epochStorageJSONString = localStorage.getItem(EPOCH_STORAGE_KEY)
    return epochStorageJSONString !== null ? new EpochStorage(JSON.parse(epochStorageJSONString)) : null
}

export function saveEpochStorageToLocalStorage(epochStorage: EpochStorage | null) {
    if (epochStorage === null) {
        localStorage.removeItem(EPOCH_STORAGE_KEY)
    } else {
        localStorage.setItem(EPOCH_STORAGE_KEY, JSON.stringify(epochStorage))
    }
}

export default function useEpochStorageState() {
    return useState<EpochStorage | null>(loadEpochStorageFromLocalStorage())
}
