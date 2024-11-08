import axios, {AxiosError} from "axios";
import {SESSION_EXPIRATION_TIME_MIN, SESSION_EXPIRES_AT_KEY} from "@/constants.ts";

const createAxiosInstance = () => {
    const client = axios.create({
        baseURL: "http://localhost:8080",
        headers: {
            Accept: 'application/json',
            'Content-Type': "application/json"
        },
        withCredentials: true
    });

    client.interceptors.request.use(request => {
        console.debug("Making request: ", request)
        return request
    })

    client.interceptors.response.use(
        response => {
            console.debug("Got response: ", response)
            localStorage.setItem(SESSION_EXPIRES_AT_KEY, (Date.now() + SESSION_EXPIRATION_TIME_MIN * 60 * 100).toString())
            return response;
        },
        (error: AxiosError) => {
            if (error.response) {
                console.debug("[interceptor] Server responded with error: ", error.message)
            } else if (error.request) {
                console.debug("[interceptor] No response from the server: ", error.message)
            } else {
                console.debug("[interceptor] Setting up request failed: ", error.message)
            }

            return Promise.reject(error)
        }
    )

    return client
}

const axiosInstance = createAxiosInstance()
export default axiosInstance