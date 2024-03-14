export type LoginRequestDTO = {
    username: string,
    password: string
}

export type HelloGetDTO = {
    name: string,
    principal: string,
    details: string,
    credentials: string,
    authorities: string[],
    sessionId: string
}