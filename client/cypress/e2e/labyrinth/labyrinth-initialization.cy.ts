import { UserPool } from '../../../cypress';
import { userPoolToDetails } from '../../support/commands.ts';

function getLabyrinthFromLocalStorage(
    user: UserPool,
    property?: 'epochStorage' | 'thisDevice',
) {
    return cy.window().then((win) => {
        const labyrinth = win.localStorage.getItem(
            `labyrinth_instance_for_user_${userPoolToDetails[user].userId}`,
        );
        if (labyrinth === null)
            throw Error('Labyrinth in local storage cannot be null');
        if (property) {
            return cy.wrap(JSON.parse(labyrinth)[property]);
        } else {
            return cy.wrap(JSON.parse(labyrinth));
        }
    });
}

function extractRecoveryCode(text: string) {
    const matchArray = /Your recovery code is:\s*(\S+)/.exec(text);
    if (matchArray?.[1]) {
        return cy.wrap(matchArray[1]);
    } else {
        throw new Error('Recovery code not found in the text!');
    }
}

function getDialog() {
    return cy.get('div[role=dialog]');
}

function getTitle(text: string) {
    return cy.contains('h2', text);
}

function getCloseButton(closeButtonText: string) {
    return cy.contains('button', closeButtonText);
}

describe('Labyrinth Initialization', () => {
    it('should derive the same epoch secrets across devices', () => {
        const chosenUser: UserPool = 'user_not_in_labyrinth';
        cy.login(chosenUser);
        cy.visit('/messages');
        getDialog().within(() => {
            getTitle('Welcome to chat with secure message storage!');
            getCloseButton('Generate Recovery Code').click();

            getTitle('Success!');
            cy.get('p')
                .invoke('text')
                .then(extractRecoveryCode)
                .as('recovery-code');
            getCloseButton('Close').click();
        });
        getLabyrinthFromLocalStorage(chosenUser, 'epochStorage').as(
            'labyrinth-before',
        );
        cy.changeToNewDevice();

        cy.login(chosenUser);
        cy.visit('/messages');

        getDialog().within(() => {
            getTitle('Welcome back!');
            cy.get<string>('@recovery-code').then((recoveryCode) => {
                return cy.get('input').type(recoveryCode);
            });
            getCloseButton('Submit').click();

            getTitle('Success!');
            getCloseButton('Close').click();
        });
        getLabyrinthFromLocalStorage(chosenUser, 'epochStorage').as(
            'labyrinth-after',
        );
        getLabyrinthFromLocalStorage(chosenUser).then((labyrinth) => {
            cy.log('labyrinth', labyrinth);
        });

        cy.get<string>('@labyrinth-before').then((labyrinthBefore) => {
            cy.get<string>('@labyrinth-after').then((labyrinthAfter) => {
                expect(labyrinthBefore).to.deep.equal(labyrinthAfter);
            });
        });
    });

    it('verify if labyrinth state loaded from fixture is the same as from recovery code', () => {
        const chosenUser: UserPool = 'user_in_labyrinth_alice';
        const chosenUserRecoveryCode =
            userPoolToDetails[chosenUser].recoveryCode!;

        cy.loadLabyrinthForUser(chosenUser);
        getLabyrinthFromLocalStorage(chosenUser, 'epochStorage').as(
            'labyrinth-before',
        );

        cy.changeToNewDevice();

        cy.login(chosenUser);
        cy.visit('/messages');

        getDialog().within(() => {
            getTitle('Welcome back!');
            cy.get('input').type(chosenUserRecoveryCode);
            getCloseButton('Submit').click();

            getTitle('Success!');
            getCloseButton('Close').click();
        });

        getLabyrinthFromLocalStorage(chosenUser, 'epochStorage').as(
            'labyrinth-after',
        );
        cy.get<string>('@labyrinth-before').then((labyrinthBefore) => {
            cy.get<string>('@labyrinth-after').then((labyrinthAfter) => {
                expect(labyrinthBefore).to.deep.equal(labyrinthAfter);
            });
        });
    });
});
