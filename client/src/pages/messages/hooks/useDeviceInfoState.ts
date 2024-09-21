import {DEVICE_KEY} from "@/constants.ts";
import {PrivateDevice} from "@/lib/labyrinth/labyrinth-types.ts";
import {useEffect, useState} from "react";

function loadDeviceInfoFromLocalStorage(): PrivateDevice | null {
    const deviceInfoJSONString = localStorage.getItem(DEVICE_KEY)
    return deviceInfoJSONString !== null ? (JSON.parse(deviceInfoJSONString) as PrivateDevice) : null
}

function saveDeviceInfoToLocalStorage(deviceInfo: PrivateDevice | null) {
    if (deviceInfo === null) {
        localStorage.removeItem(DEVICE_KEY);
    } else {
        localStorage.setItem(DEVICE_KEY, JSON.stringify(deviceInfo))
    }
}

export default function useDeviceInfo() {
    const [deviceInfo, setDeviceInfo] = useState<PrivateDevice | null>(loadDeviceInfoFromLocalStorage())

    useEffect(() => {
        saveDeviceInfoToLocalStorage(deviceInfo);
    }, [deviceInfo])

    return [deviceInfo, setDeviceInfo] as const
}

