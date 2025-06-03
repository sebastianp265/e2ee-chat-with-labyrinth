export const userPoolToDetails: Record<
    string,
    {
        visibleName: string;
        recoveryCode: string | undefined;
        userId: string | undefined;
    }
> = {
    user_in_labyrinth_alice: {
        visibleName: 'Alice - in labyrinth',
        recoveryCode: '10CMLH1L4WMMU9RN6PS843V7R6VC1ZT6RTH0XXXX',
        userId: '14c6d51b-1d4a-4be9-a5e2-df771ebf2051',
    },
    user_in_labyrinth_bob: {
        visibleName: 'Bob - in labyrinth',
        recoveryCode: undefined,
        userId: 'cb563237-a662-4e07-9396-511cdbe84159',
    },
    user_in_labyrinth_carol: {
        visibleName: 'Carol - in labyrinth',
        recoveryCode: undefined,
        userId: 'c9b7d33c-ea52-4068-98e7-fbf114ca1262',
    },
};

Cypress.Commands.add('login', (username) => {
    const password = '123456';

    cy.request({
        method: 'POST',
        url: 'http://localhost:8080/api/auth/login',
        body: { username, password },
        headers: {
            'Content-Type': 'application/json',
        },
    }).then((response) => {
        expect(response.status).to.eq(200);

        cy.getCookie('SESSION').should('exist');
        cy.window().then((win) => {
            win.localStorage.setItem('logged_user_id', response.body.userId);
            win.localStorage.setItem(
                'session_expires_at',
                (Date.now() + 60 * 60 * 1000).toString(),
            );
        });
    });
});

Cypress.Commands.add('loadLabyrinthForUser', (username, loadFixtureOnly) => {
    const fullPath = `local-storage/${username}.json`;
    cy.fixture(fullPath).then((obj) => {
        cy.window().then((win) => {
            win.localStorage.setItem(`labyrinth_instance_for_user_${userPoolToDetails[username].userId}`, JSON.stringify(obj));
        });
        cy.log(`loaded fixture: ${fullPath}`);
    });
    if (loadFixtureOnly == false || loadFixtureOnly == undefined) {
        cy.task('runSQLs', { filenames: [`${username}.sql`] });
    }
});

Cypress.Commands.add('connectToWebSocketAs', (username) => {
    cy.task('getSessionCookieOfUser', { username }).then((sessionCookie) => {
        const bobConnection = `${username}_connection`;
        cy.task('connectWebSocket', {
            connectionName: bobConnection,
            cookie: sessionCookie,
        }).should('equal', 'WebSocket connected');
    });
});

Cypress.Commands.add('sendMessageAs', (username, message) => {
    const connectionName = `${username}_connection`;
    cy.log(`Sending message as ${username}`, JSON.stringify(message));
    cy.task('sendWebSocketMessage', { connectionName, message });
});

Cypress.Commands.add('getMessagesAs', (username) => {
    const connectionName = `${username}_connection`;
    return cy.task('getWebSocketMessages', { connectionName });
});

Cypress.Commands.add('changeToNewDevice', () => {
    cy.clearAllLocalStorage();
    cy.clearAllCookies();
    cy.clearAllSessionStorage();
    cy.reload();
});
