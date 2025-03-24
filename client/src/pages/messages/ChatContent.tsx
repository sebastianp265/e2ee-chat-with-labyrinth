import { Button } from '@/components/ui/button.tsx';
import ThreadPreview, {
    ThreadPreviewData,
} from '@/components/app/messages/ThreadPreview.tsx';
import CreateThread from '@/components/app/messages/CreateThread.tsx';
import Thread, { ThreadData } from '@/components/app/messages/Thread.tsx';
import useChatWebSocket, {
    ReceivedNewChatMessagePayload,
    ReceivedNewChatThreadPayload,
} from '@/pages/messages/hooks/useChatWebSocket.ts';
import { useCallback, useMemo, useState } from 'react';
import useFriendsData from '@/pages/messages/hooks/useFriendsData.ts';
import { Labyrinth } from '@sebastianp265/safe-server-side-storage-client';
import useThreadsData from '@/pages/messages/hooks/useThreadsData.ts';
import { ThreadsDataStore } from '@/pages/messages/utils/threadsData.ts';

type ChatContentProps = {
    loggedUserId: string;
    labyrinth: Labyrinth | null;
};

function getThreadDataFromStore(
    threadsDataStore: ThreadsDataStore,
    threadId: string,
) {
    const threadDataUnconverted = threadsDataStore.map[threadId];
    return {
        threadName:
            threadDataUnconverted.threadName ??
            `Chat between: ${Object.values(threadDataUnconverted.membersVisibleNameByUserId).join(', ')}`,
        messages: threadDataUnconverted.messages,
        membersVisibleNameByUserId:
            threadDataUnconverted.membersVisibleNameByUserId,
    } as ThreadData;
}

function threadPreviewDataFromThreadData(
    threadId: string,
    threadData: ThreadData,
): ThreadPreviewData {
    const lastThreadMessage =
        threadData.messages[threadData.messages.length - 1];

    return {
        threadId: threadId,
        threadName: threadData.threadName,
        lastMessage: lastThreadMessage.content,
        lastMessageAuthorVisibleName:
            threadData.membersVisibleNameByUserId[lastThreadMessage.authorId],
    };
}

export default function ChatContent({
    loggedUserId,
    labyrinth,
}: Readonly<ChatContentProps>) {
    const {
        threadsDataStore,
        chosenThreadId,
        setChosenThreadId,
        addMessageToStore,
        addThreadToStore,
        encryptAndPostMessage,
    } = useThreadsData(labyrinth);

    const { friends } = useFriendsData();

    const isLabyrinthInitialized = useMemo(
        () => labyrinth !== null,
        [labyrinth],
    );
    const onNewChatMessageReceivedCallback = useCallback(
        (payload: ReceivedNewChatMessagePayload) => {
            if (isLabyrinthInitialized) {
                addMessageToStore(payload);
                encryptAndPostMessage(payload.threadId, payload.message);
            }
        },
        [isLabyrinthInitialized],
    );
    const onNewChatThreadReceivedCallback = useCallback(
        (payload: ReceivedNewChatThreadPayload) => {
            if (isLabyrinthInitialized) {
                addThreadToStore(payload);
                encryptAndPostMessage(payload.threadId, payload.initialMessage);
            }
        },
        [isLabyrinthInitialized],
    );

    const { sendChatMessage, createChatThread } = useChatWebSocket(
        isLabyrinthInitialized,
        onNewChatMessageReceivedCallback,
        onNewChatThreadReceivedCallback,
    );

    const [createThreadOpen, setCreateThreadOpen] = useState<boolean>(false);

    return (
        <>
            <div className="flex flex-col space-y-2 border p-2 w-[20%]">
                <Button
                    onClick={() => {
                        setCreateThreadOpen(true);
                    }}
                >
                    Create new thread
                </Button>
                <div data-cy="thread-previews-container">
                    {threadsDataStore.keys.map((threadId) => (
                        <ThreadPreview
                            key={threadId}
                            threadPreviewData={threadPreviewDataFromThreadData(
                                threadId,
                                getThreadDataFromStore(
                                    threadsDataStore,
                                    threadId,
                                ),
                            )}
                            onClick={() => {
                                setCreateThreadOpen(false);
                                setChosenThreadId(threadId);
                            }}
                            chosenThreadId={chosenThreadId}
                        />
                    ))}
                </div>
            </div>
            <div className="flex p-2 flex-grow border border-l-0 flex-col w-full">
                {createThreadOpen ? (
                    <CreateThread
                        friends={friends}
                        handleCreateThread={(newThread) => {
                            createChatThread(newThread);
                            setCreateThreadOpen(false);
                        }}
                    />
                ) : (
                    chosenThreadId !== null && (
                        <Thread
                            loggedUserId={loggedUserId}
                            threadData={getThreadDataFromStore(
                                threadsDataStore,
                                chosenThreadId,
                            )}
                            handleSendMessage={(messageContent: string) =>
                                sendChatMessage({
                                    threadId: chosenThreadId,
                                    content: messageContent,
                                })
                            }
                        />
                    )
                )}
            </div>
        </>
    );
}
