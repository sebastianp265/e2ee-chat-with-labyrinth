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
import httpClient from '@/api/httpClient.ts';
import { useNavigate } from 'react-router-dom';
import { LogOut, PlusSquare } from 'lucide-react';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';

type ChatContentProps = {
    loggedUserId: string;
    labyrinth: Labyrinth | null;
    inactivateSession: () => void;
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
    inactivateSession,
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
    const navigate = useNavigate();

    const handleLogout = () => {
        httpClient.post('/api/auth/logout')
            .catch((error) => {
                console.error('Logout failed', error);
            })
            .finally(() => {
                inactivateSession()
                navigate('/login');
            });
    };

    return (
        <>
            <div className="flex flex-col space-y-2 border p-2 w-[20%]">
                <TooltipProvider>
                    <div className="flex space-x-2 justify-end w-full">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    onClick={() => {
                                        setCreateThreadOpen(true);
                                    }}
                                    aria-label="Create new thread"
                                    size="icon"
                                    variant="outline"
                                    className="rounded-full"
                                    disabled={!isLabyrinthInitialized}
                                >
                                    <PlusSquare className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Create new thread</p>
                            </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    onClick={handleLogout}
                                    variant="outline"
                                    aria-label="Logout"
                                    size="icon"
                                    className="rounded-full"
                                    disabled={!isLabyrinthInitialized}
                                >
                                    <LogOut className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Logout</p>
                            </TooltipContent>
                        </Tooltip>
                    </div>
                </TooltipProvider>
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
