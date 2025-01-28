import {
    NewChatMessageToSendPayload,
    NewChatThreadToSendPayload,
} from '@/pages/messages/hooks/useChatWebSocket.ts';
import { UserPool } from '../../../cypress';
import { userPoolToDetails } from 'cypress/support/commands';

describe('Creating threads', () => {
    beforeEach(() => {
        cy.intercept('POST', '/api/chat-service/threads/*/messages').as(
            'store-message',
        );
    });

    function createThread(
        withUsers: UserPool[],
        userMessagePairs: [UserPool, string][],
    ) {
        cy.get('button').click();

        cy.get('div[cmdk-list]').should('be.hidden');
        cy.get('input[cmdk-input]').click();
        cy.get('div[cmdk-list]').within(() => {
            for (const userToAdd of withUsers) {
                cy.get(
                    `div[data-value="${userPoolToDetails[userToAdd].visibleName}"]`,
                ).click();
            }
        });
        cy.get("div[data-cy='message-input']").within(() => {
            cy.get('textarea').type(userMessagePairs[0][1]);
            cy.get('button').click();
        });
    }

    function checkChatThreadContent(
        users: UserPool[],
        userMessagePairs: [UserPool, string][],
    ) {
        const threadName = `Chat between: ${users.map((u) => userPoolToDetails[u].visibleName).join(', ')}`;
        const lastMessageAuthor =
            userMessagePairs[userMessagePairs.length - 1][0];
        const lastMessageAuthorVisibleName =
            userPoolToDetails[lastMessageAuthor].visibleName;

        cy.get("div[data-cy='thread-previews-container']").within(() => {
            cy.get('button')
                .as('thread-preview')
                .should(
                    'contain.text',
                    `${threadName}${lastMessageAuthorVisibleName}: ${userMessagePairs[userMessagePairs.length - 1][1]}`,
                );

            cy.get('@thread-preview').click();
        });

        cy.get("span[data-cy='thread-name']").should(
            'have.text',
            `${threadName}`,
        );

        for (let i = 0; i < userMessagePairs.length; i++) {
            cy.get(`[data-cy="messages"] > :nth-child(${i + 1})`).should(
                'contain.text',
                userMessagePairs[i][1],
            );
        }
    }

    function performSendingMessages(
        thisUser: UserPool,
        otherUsers: UserPool[],
        userMessagePairs: [UserPool, string][],
    ) {
        cy.get("div[data-cy='thread-previews-container']").within(() => {
            cy.get('button').click();
        });
        cy.wait('@store-message').then((interception) => {
            const url = interception.request.url;
            const threadId = url.split('/')[6];
            cy.wrap(userMessagePairs).each(
                ([user, message]: [UserPool, string]) => {
                    if (user === thisUser) {
                        cy.get("div[data-cy='message-input']").within(() => {
                            cy.get('textarea').type(message);
                            cy.get('button').click();
                        });
                    } else {
                        const otherUser = otherUsers.find((ou) => ou === user);
                        if (!otherUser) throw new Error('Error in test data');
                        cy.sendMessageAs(otherUser, {
                            type: 'NEW_CHAT_MESSAGE',
                            payload: {
                                threadId,
                                content: message,
                            } as NewChatMessageToSendPayload,
                        });
                    }
                },
            );
        });
    }

    it.only('alice creates thread with initial message and bob should receive it and this thread persists after reload', () => {
        const alice: UserPool = 'user_in_labyrinth_alice';
        const bob: UserPool = 'user_in_labyrinth_bob';

        cy.connectToWebSocketAs(bob);

        cy.loadLabyrinthForUser(alice);
        cy.login(alice);

        cy.visit('/messages');

        const userMessagePairs: [UserPool, string][] = [
            [alice, 'Hello Bob!'],
            [bob, 'Hi Alice!'],
            [bob, 'How are you doing?'],
            [alice, 'Pretty well, thanks for asking.'],
            [alice, 'I have just come back from a walk with my dogs.'],
            [bob, 'Wow!!! You have dogs??'],
            [bob, 'What breed are they?'],
            [alice, 'Both are long-haired German Shepherds :)'],
        ];

        cy.pause();

        createThread([bob], userMessagePairs);

        cy.pause();
        checkChatThreadContent([alice, bob], [userMessagePairs[0]]);

        performSendingMessages(alice, [bob], userMessagePairs.slice(1));
        checkChatThreadContent([alice, bob], userMessagePairs);

        cy.reload();

        cy.pause();

        checkChatThreadContent([alice, bob], userMessagePairs);
    });

    it('bob creates thread with carol, alice is logged and sees it in real time, then after sending messages thread data loads after refreshing page', () => {
        const alice: UserPool = 'user_in_labyrinth_alice';
        const bob: UserPool = 'user_in_labyrinth_bob';
        const carol: UserPool = 'user_in_labyrinth_carol';
        cy.connectToWebSocketAs(bob);
        cy.connectToWebSocketAs(carol);

        cy.login(alice);
        cy.loadLabyrinthForUser(alice);
        cy.visit('/messages');

        // TODO: Delay needs to be added so Alice get create a websocket session with the server before bob creates thread,
        //  should be resolved later when data will be added to temporary db
        cy.wait(100);

        const userMessagePairs: [UserPool, string][] = [
            [bob, 'Hi Alice!'],
            [alice, 'Hello Bob!'],
            [bob, 'How are you doing?'],
            [alice, 'Pretty well, thanks for asking.'],
            [alice, 'I have just come back from a walk with my dogs.'],
            [bob, 'Wow!!! You have dogs??'],
            [bob, 'What breed are they?'],
            [alice, 'Both are long-haired German Shepherds :)'],
            [carol, "Oh that's lovely!!"],
            [carol, 'Show some pictures!!!'],
        ];
        cy.sendMessageAs(bob, {
            type: 'NEW_CHAT_THREAD',
            payload: {
                otherMemberUserIds: [
                    userPoolToDetails[alice].userId,
                    userPoolToDetails[carol].userId,
                ],
                initialMessageContent: userMessagePairs[0][1],
            } as NewChatThreadToSendPayload,
        });

        checkChatThreadContent([alice, bob, carol], [userMessagePairs[0]]);
        performSendingMessages(alice, [bob, carol], userMessagePairs.slice(1));
        checkChatThreadContent([alice, bob, carol], userMessagePairs);

        cy.reload();

        checkChatThreadContent([alice, bob, carol], userMessagePairs);
    });
});
