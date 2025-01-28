import './commands';

beforeEach(() => {
    cy.task('runSQLs', { filenames: ['clean.sql', 'users.sql', 'chat.sql'] });
    cy.changeToNewDevice();
    cy.task('resetWebSocketConnections');
    cy.task('clearRedis');
    const percentage = 0.5;
    cy.viewport(1920 * percentage, 1080 * percentage);
});
