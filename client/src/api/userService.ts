import httpClient from '@/api/httpClient.ts';

const userServicePrefix = '/api/user-service';

export type FriendDTO = {
    userId: string;
    visibleName: string;
};

export const userService = {
    getFriends: async () =>
        (await httpClient.get<FriendDTO[]>(`${userServicePrefix}/friends`))
            .data,
};
