import { UserPool } from '../../../cypress';
import { userPoolToDetails } from '../../support/commands.ts';

describe('Labyrinth Initialization', () => {
    const extractRecoveryCode = (text: string) => {
        const matchArray = text.match(/Your recovery code is:\s*(\S+)/);
        if (matchArray && matchArray[1]) {
            return cy.wrap(matchArray[1]);
        } else {
            throw new Error('Recovery code not found in the text!');
        }
    };

    const getLabyrinthFromLocalStorage = () => {
        return cy.window().then((win) => {
            const labyrinth = win.localStorage.getItem('labyrinth');
            if (labyrinth === null)
                throw Error('Labyrinth in local storage cannot be null');
            return cy.wrap(labyrinth);
        });
    };

    const getDialogExpectTitleAndButtonName = (
        title: string,
        button: string,
    ) => {
        cy.get('div[role=alertdialog]').should(
            'have.attr',
            'data-state',
            'open',
        );
        cy.get('div[role=alertdialog]').within(() => {
            cy.get('h2').should('have.text', title);
            cy.get('button').should('have.text', button);
        });
        return cy.get('div[role=alertdialog]');
    };

    const checkLabyrinthBeforeAndAfterState = () => {
        cy.get<string>('@labyrinth-before').then((labyrinthBefore) => {
            cy.get<string>('@labyrinth-after').then((labyrinthAfter) => {
                const before = JSON.parse(labyrinthBefore);
                const after = JSON.parse(labyrinthAfter);

                expect(JSON.stringify(before.epochStorage)).to.equal(
                    JSON.stringify(after.epochStorage),
                );
            });
        });
    };

    it('should derive the same epoch secrets across devices', () => {
        const chosenUser: UserPool = 'user_not_in_labyrinth';
        cy.login(chosenUser);
        cy.visit('/messages');
        getDialogExpectTitleAndButtonName(
            'Welcome to chat with secure message storage!',
            'Generate Recovery Code',
        )
            .find('button')
            .click();

        getDialogExpectTitleAndButtonName('Success', 'Close').as(
            'success-dialog',
        );
        cy.get('@success-dialog')
            .find('p')
            .invoke('text')
            .then(extractRecoveryCode)
            .as('recovery-code');
        cy.get('@success-dialog').find('button').click();
        cy.get('@success-dialog').should('not.exist');

        getLabyrinthFromLocalStorage().as('labyrinth-before');
        cy.changeToNewDevice();

        cy.login(chosenUser);
        cy.visit('/messages');

        getDialogExpectTitleAndButtonName('Welcome back!', 'Submit').as(
            'welcome-back-dialog',
        );
        cy.get<string>('@recovery-code').then((recoveryCode) => {
            return cy
                .get('@welcome-back-dialog')
                .find('input')
                .type(recoveryCode);
        });
        cy.get('@welcome-back-dialog').find('button').click();

        getDialogExpectTitleAndButtonName('Success', 'Close')
            .find('button')
            .click();
        getLabyrinthFromLocalStorage().as('labyrinth-after');

        cy.get('@welcome-back-dialog').should('not.exist');

        checkLabyrinthBeforeAndAfterState();
    });

    it('verify if labyrinth state loaded from fixture is the same as from recovery code', () => {
        const chosenUser: UserPool = 'user_in_labyrinth_alice';
        const chosenUserRecoveryCode =
            userPoolToDetails[chosenUser].recoveryCode!;

        cy.loadLabyrinthForUser(chosenUser);
        getLabyrinthFromLocalStorage().as('labyrinth-before');

        cy.changeToNewDevice();

        cy.login(chosenUser);
        cy.visit('/messages');

        getDialogExpectTitleAndButtonName('Welcome back!', 'Submit').as(
            'welcome-back-dialog',
        );

        cy.get('@welcome-back-dialog')
            .find('input')
            .type(chosenUserRecoveryCode);
        cy.get('@welcome-back-dialog').find('button').click();

        getDialogExpectTitleAndButtonName('Success', 'Close')
            .find('button')
            .click();

        getLabyrinthFromLocalStorage().as('labyrinth-after');
        checkLabyrinthBeforeAndAfterState();
    });
});
