import React, {useEffect, useState} from "react";
import {UserIDToNameMap} from "@/api/api-types.ts";
import axiosAPI from "@/api/axiosAPI.ts";

export default function useUserIDToNameMapForChosenThread(chosenThreadID: string,
                                                          setError: React.Dispatch<string>) {
    const [userIdToNameForChosenThread, setUserIdToNameForChosenThread] = useState<UserIDToNameMap>({})

    useEffect(() => {
        axiosAPI.get<UserIDToNameMap>(`api/threads/${chosenThreadID}/members`)
            .then(response => {
                setUserIdToNameForChosenThread(response.data)
            })
            .catch((error: unknown) => {
                let message = 'Unknown Error'
                if(error instanceof Error) message = error.message

                setError(message)
            })
    }, [chosenThreadID, setError]);

    return userIdToNameForChosenThread
}