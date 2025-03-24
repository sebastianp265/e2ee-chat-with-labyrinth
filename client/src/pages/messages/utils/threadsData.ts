import {
    AddMessageActionPayload,
    AddThreadActionPayload,
    Message,
} from '@/pages/messages/hooks/useThreadsData.ts';

export type ThreadsDataStore = {
    map: {
        [threadId: string]: {
            threadName: string | null;
            messages: Message[];
            membersVisibleNameByUserId: {
                [userId: string]: string;
            };
        };
    };
    keys: string[];
};

type Action =
    | { type: 'ADD_MESSAGE'; payload: AddMessageActionPayload }
    | { type: 'ADD_THREAD'; payload: AddThreadActionPayload };

function combineMessages(prevMessages: Message[], messageToAdd: Message) {
    const insertIndex = prevMessages.findIndex(
        (m) => m.timestamp >= messageToAdd.timestamp,
    );
    if (insertIndex === -1) {
        return [...prevMessages, messageToAdd];
    }
    if (prevMessages[insertIndex].id === messageToAdd.id) {
        return prevMessages;
    }

    return [
        ...prevMessages.slice(0, insertIndex),
        messageToAdd,
        ...prevMessages.slice(insertIndex),
    ];
}

export function threadsDataReducer(
    state: ThreadsDataStore,
    action: Action,
): ThreadsDataStore {
    switch (action.type) {
        case 'ADD_MESSAGE': {
            const { threadId, message } = action.payload;

            if (Object.hasOwn(state.map, threadId)) {
                return {
                    map: {
                        ...state.map,
                        [threadId]: {
                            ...state.map[threadId],
                            messages: combineMessages(
                                state.map[threadId].messages,
                                message,
                            ),
                        },
                    },
                    keys: [
                        threadId,
                        ...state.keys.filter((key) => key !== threadId),
                    ],
                };
            }

            return {
                map: {
                    ...state.map,
                    [threadId]: {
                        threadName: null,
                        messages: [message],
                        membersVisibleNameByUserId: {},
                    },
                },
                keys: [
                    threadId,
                    ...state.keys.filter((key) => key !== threadId),
                ],
            };
        }
        case 'ADD_THREAD': {
            const {
                threadId,
                threadName,
                initialMessage,
                membersVisibleNameByUserId,
            } = action.payload;

            return {
                map: {
                    ...state.map,
                    [threadId]: {
                        threadName,
                        messages: [initialMessage],
                        membersVisibleNameByUserId,
                    },
                },
                keys: [
                    threadId,
                    ...state.keys.filter((key) => key !== threadId),
                ],
            };
        }
    }
}
