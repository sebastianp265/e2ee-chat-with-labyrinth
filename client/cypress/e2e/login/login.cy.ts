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
});
