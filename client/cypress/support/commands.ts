Cypress.Commands.add('login', (username, password) => {
    // TODO: Login programmatically
    cy.visit('/login')

    cy.get('input[name=username]').type(username)
    cy.get('input[name=password]').type(password)

    cy.get('button[type=submit]').click()

    cy.url().should('include', '/messages')
    cy.getCookie('SESSION').should('exist')
})