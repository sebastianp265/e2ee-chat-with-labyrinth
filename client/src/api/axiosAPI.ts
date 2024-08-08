import axios, {AxiosError} from "axios";

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
        console.debug("Making request:", request)
        return request
    })

    client.interceptors.response.use(
        response => {
            console.debug("Got response: ", response)
            localStorage.setItem(import.meta.env.VITE_SESSION_EXPIRES_AT_LOCAL_STORAGE_KEY,
                (Date.now() + parseInt(import.meta.env.VITE_SESSION_EXPIRATION_TIME_MIN) * 60 * 1000).toString())
            return response;
        },
        (error: AxiosError) => {
            if (error.request) {
                console.error(error.request)
            } else {
                console.error("Request was not made: ", error.message)
            }
            return Promise.reject(error)
        }
    )

    return client
}

const axiosAPI = createAxiosInstance()
export default axiosAPI