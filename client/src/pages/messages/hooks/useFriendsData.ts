import {useEffect, useState} from "react";
import axiosInstance from "@/api/axios/axiosInstance.ts";
import {Friend} from "@/components/app/messages/CreateThread.tsx";
import {AxiosError} from "axios";

export default function useFriendsData() {
    const [friends, setFriends] = useState<Friend[]>([])
    const [error, setError] = useState<AxiosError | null>(null)

    function addFriends(friends: Friend[]) {
        setFriends(prevState => [...friends, ...prevState])
    }

    useEffect(() => {
        axiosInstance.get<Friend[]>(`/api/users/friends`)
            .then(response => {
                setFriends(response.data)
            })
            .catch(setError)
    }, [setError])

    return {friends, error, addFriends} as const;
}