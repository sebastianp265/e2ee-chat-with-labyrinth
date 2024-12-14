import {useCallback, useEffect, useState} from "react";
import {Friend} from "@/components/app/messages/CreateThread.tsx";
import {AxiosError} from "axios";
import {userService} from "@/api/userService.ts";

export default function useFriendsData() {
    const [friends, setFriends] = useState<Friend[]>([])
    // TODO: Proper error handling
    const [error, setError] = useState<AxiosError | null>(null)

    const addFriends = useCallback((friends: Friend[]) => {
        setFriends(prevState => [...friends, ...prevState])
    }, [])

    useEffect(() => {
        userService.getFriends()
            .then(setFriends)
    }, [setError])

    return {friends, error, addFriends} as const;
}