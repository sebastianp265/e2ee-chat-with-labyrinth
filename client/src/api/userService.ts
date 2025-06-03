import httpClient from '@/api/httpClient.ts';

const userServicePrefix = '/api/user-service';

export type FriendDTO = {
    userId: string;
    visibleName: string;
};

export const userService = {
    getFriends: async (): Promise<FriendDTO[]> => {
        const { data } = await httpClient.get<FriendDTO[]>(
            `${userServicePrefix}/friends`,
        );
        return data;
    },
};
