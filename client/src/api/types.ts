export type LoginRequestDTO = {
    username: string,
    password: string
}

export type Hello = {
    name: string,
    principal: string,
    details: string,
    credentials: string,
    authorities: string[],
    sessionId: string
}