describe('labyrinth initialization', () => {
    beforeEach("delete state in local storage", () => {
        cy.clearAllLocalStorage()
        cy.task("connectDB", {filePath: "./cypress/database/clean.sql"})
            .then(output => cy.log(<string>output))
    })

    it('should derive same epoch secrets when logging first time and then logging on other device', () => {
        cy.login("seba", "seba123")

        cy.get("div[role=alertdialog]")
            .should('have.attr', 'data-state', 'open')
            .children()
            .as("welcome-dialog")

        cy.get("@welcome-dialog")
            .children("h2")
            .should("have.text", "Welcome to chat with secure message storage!")

        cy.get("@welcome-dialog")
            .children("button")
            .should("have.text", "Generate Recovery Code")
            .click()

        cy.get("div[role=alertdialog]")
            .should('have.attr', 'data-state', 'open')
            .children()
            .as("success-dialog")

        cy.get("@success-dialog")
            .children("h2")
            .should("have.text", "Success")

        cy.get("@success-dialog")
            .children("p")
            .invoke("text")
            .then((text) => {
                const matchArray = text.match(/Your recovery code is:\s*(\S+)/)
                if (matchArray && matchArray[1]) {
                    const recoveryCode = matchArray[1];
                    cy.wrap(recoveryCode).as("recoveryCode");
                } else {
                    throw new Error("Recovery code not found in the text!");
                }
            })

        cy.clearAllLocalStorage()
        cy.reload()
        cy.login("seba", "seba123")

        cy.get("div[role=alertdialog]")
            .should('have.attr', 'data-state', 'open')
            .children()
            .as("welcome-dialog")

        cy.get("@welcome-dialog")
            .children("h2")
            .should("have.text", "Welcome back!")

        cy.get("@recoveryCode").then((recoveryCode) => {
            cy.get("input[name=recoveryCode]").type(recoveryCode);
            cy.get("button[type=submit]")
                .click()
        })
    })
})
