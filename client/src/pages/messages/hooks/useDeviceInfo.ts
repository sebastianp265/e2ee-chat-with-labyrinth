import {DEVICE_KEY} from "@/constants.ts";
import {SelfDevice} from "@/lib/labyrinth/labyrinth-types.ts";
import {useState} from "react";

function loadDeviceInfoFromLocalStorage() {
    const deviceInfoJSONString = localStorage.getItem(DEVICE_KEY)
    return deviceInfoJSONString !== null ? JSON.parse(deviceInfoJSONString) as SelfDevice : undefined
}

export default function useSelfDevice() {
    return useState(loadDeviceInfoFromLocalStorage())
}