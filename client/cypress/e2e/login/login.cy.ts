import { UserPool } from '../../../cypress';

describe('The Login Page', () => {
    it('sets auth cookie when logging in via form submission', () => {
        const username: UserPool = 'user_for_logging_in';
        const password = '123456';

        cy.visit('/login');

        cy.get('input[name=username]').type(username);
        cy.get('input[name=password]').type(password);

        cy.get('button[type=submit]').click();

        cy.url().should('include', '/messages');
        cy.getCookie('SESSION').should('exist');
    });

    it('logs out successfully', () => {
        const username: UserPool = 'user_in_labyrinth_alice';
        cy.login(username);
        cy.loadLabyrinthForUser(username);

        cy.visit('/messages');
        cy.get('button[aria-label="Logout"]').should('not.be.disabled').click();
        cy.url().should('include', '/login');
    });

    it.only('shows an error message on failed login', () => {
        cy.visit('/login');

        cy.get('input[name=username]').type('invalid_user');
        cy.get('input[name=password]').type('wrong_password');
        cy.get('button[type=submit]').click();

        cy.url().should('include', '/login');
        cy.getCookie('SESSION').should('not.exist');
        cy.contains('Invalid username or password. Please try again.').should('be.visible');
    });
});
