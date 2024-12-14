import './commands';

beforeEach(() => {
    cy.task('runSQLs', { filenames: ['clean.sql', 'users.sql', 'chat.sql'] });
    cy.changeToNewDevice();
    cy.task('resetWebSocketConnections');
});
