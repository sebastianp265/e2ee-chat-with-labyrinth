import React, {useEffect, useState} from "react";
import {IUserPreviewProps} from "@/components/app/messages/UserPreview.tsx";
import axiosAPI from "@/api/axiosAPI.ts";

export default function useFriendsState(setError: React.Dispatch<string>) {
    const [friends, setFriends] = useState<IUserPreviewProps[]>([])

    useEffect(() => {
        axiosAPI.get<IUserPreviewProps[]>(`/api/friends`)
            .then(response => {
                setFriends(response.data)
            })
            .catch((error: unknown) => {
                let message = 'Unknown Error'
                if (error instanceof Error) message = error.message

                setError(message)
            })
    }, [setError])

    return [friends, setFriends] as const;
}