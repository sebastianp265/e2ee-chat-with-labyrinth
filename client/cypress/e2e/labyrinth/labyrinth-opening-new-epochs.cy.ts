import { UserPool } from '../../../cypress';
import { userPoolToDetails } from '../../support/commands.ts';
import { NewChatThreadToSendPayload } from '@/pages/messages/hooks/useChatWebSocket.ts';
import { EpochStorage } from '@sebastianp265/safe-server-side-storage-client/EpochStorage';
import { bytesSerializerProvider } from '@sebastianp265/safe-server-side-storage-client';
import { base64StringToBytes, bytesToBase64String } from '@/lib/utils.ts';

describe('Opening new epochs', () => {
    const alice: UserPool = 'user_in_labyrinth_alice';

    function changeToNewDeviceAndInsertRecoveryCode() {
        cy.log('Changing to new device and inserting recovery code...');
        cy.changeToNewDevice();
        cy.login(alice);
        cy.visit('/messages');

        cy.get('input').type(userPoolToDetails[alice].recoveryCode!);
        cy.contains('div[role="dialog"] button', 'Submit').click();
        cy.contains('div[role="dialog"] button', 'Close').click();
    }

    function waitMaxInactivityTime() {
        cy.log('Waiting...');
        cy.intercept(
            'POST',
            `/api/labyrinth-service/epochs/open-based-on-current/*/by-device/*`,
        ).as('open-epoch');

        cy.wait(16 * 1000);
        cy.reload();

        cy.wait('@open-epoch');
    }

    function sendMessageAs(sender: UserPool, message: string) {
        cy.log(`User ${sender} sends message ${message}`);

        cy.connectToWebSocketAs(sender);
        cy.sendMessageAs(sender, {
            type: 'NEW_CHAT_THREAD',
            payload: {
                otherMemberUserIds: [userPoolToDetails[alice].userId],
                initialMessageContent: message,
            } as NewChatThreadToSendPayload,
        });
    }

    function getEpochIdBySequenceIdFromLocalStorage(
        loggedUserId: UserPool,
        epochSequenceId: string,
    ) {
        return cy.window().then((win) => {
            const labyrinth = win.localStorage.getItem(
                `labyrinth_instance_for_user_${userPoolToDetails[loggedUserId].userId}`,
            );
            if (!labyrinth) {
                throw new Error();
            }
            bytesSerializerProvider.bytesSerializer = {
                serialize: bytesToBase64String,
                deserialize: base64StringToBytes,
            };
            const epochStorage: EpochStorage = EpochStorage.deserialize(
                JSON.parse(labyrinth).epochStorage,
            );
            return epochStorage.getEpoch(epochSequenceId).id;
        });
    }

    it('New epoch should be open after device inactivity', () => {
        const bob: UserPool = 'user_in_labyrinth_bob';
        const carol: UserPool = 'user_in_labyrinth_carol';

        cy.login(alice);
        cy.loadLabyrinthForUser(alice);
        cy.visit('/messages');

        cy.intercept({
            method: 'POST',
            url: `/api/chat-service/threads/*/messages`,
        }).as('message-sent-to-storage');

        sendMessageAs(bob, 'Message sent in first epoch');

        cy.wait(`@message-sent-to-storage`).then((interception) => {
            const usedEpochId = interception.request.body.epochId;
            getEpochIdBySequenceIdFromLocalStorage(alice, '0').then(
                (firstEpochId) => {
                    expect(usedEpochId).to.equal(firstEpochId);
                },
            );
        });

        changeToNewDeviceAndInsertRecoveryCode();
        waitMaxInactivityTime();

        sendMessageAs(carol, 'Message sent in second epoch');

        cy.wait(`@message-sent-to-storage`).then((interception) => {
            const usedEpochId = interception.request.body.epochId;
            getEpochIdBySequenceIdFromLocalStorage(alice, '1').then(
                (secondEpochId) => {
                    expect(usedEpochId).to.equal(secondEpochId);
                },
            );
        });

        changeToNewDeviceAndInsertRecoveryCode();
        cy.get('div[data-cy="thread-previews-container"]')
            .should('contain', 'Message sent in first epoch')
            .should('contain', 'Message sent in second epoch');
    });
});
