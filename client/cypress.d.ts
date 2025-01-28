import { mount } from 'cypress/react18';

type UserPool =
    | 'user_for_logging_in'
    | 'user_not_in_labyrinth'
    | 'user_in_labyrinth_alice'
    | 'user_in_labyrinth_bob'
    | 'user_in_labyrinth_carol';

declare global {
    namespace Cypress {
        interface Chainable {
            mount: typeof mount;
        }

        interface Chainable {
            login(username: UserPool): Chainable<void>;

            loadLabyrinthForUser(
                username: UserPool,
                loadFixtureOnly: boolean = false,
            ): Chainable<void>;

            connectToWebSocketAs(username: UserPool): Chainable<void>;

            sendMessageAs(username: UserPool, message: object): Chainable<void>;

            getMessagesAs(username: UserPool): Chainable<object[]>;

            changeToNewDevice(): Chainable<void>;
        }
    }
}
