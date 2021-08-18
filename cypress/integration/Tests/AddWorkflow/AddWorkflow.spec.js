// AddWorkflow.spec.js created with Cypress
//
// Start writing your Cypress tests below!
// If you're unfamiliar with how Cypress works,
// check out the link below and learn how to write your first test:
// https://on.cypress.io/writing-first-test

const { isUnionTypeNode } = require("typescript");

describe("testing the add workflow functionality", () => {   
    before(() =>{
        cy.clearCookies();
        cy.visit('http://localhost:8100');
        cy.get('#loginEmail').type('brenton.stroberg@yahoo.co.za')
        cy.get('#loginPassword').type('Password#1')
        cy.get('#login').click()
        cy.url().should('eq','http://localhost:8100/home');
        cy.wait(8000);
        cy.visit('http://localhost:8100/home/addWorkflow');
    });

    it('Check if next is active',()=>{
        // !cy.get('#changeOver').click();
    });

    it("input the data", ()=>{
        cy.get('#workflowName').type('This is a document name');
        cy.get('#workflowDescription').type("This is the workflow description")
        const fileName='Timesheet-Template.pdf';
        cy.fixture(fileName).then(fileContent =>{
            cy.get('input[type=file]').upload({fileContent, fileName, mimeType: 'application/pdf'})
        })

        cy.wait(3000)

     //click close button
     cy.get('.mfp-close').click()
     cy.get('#changeover').click();
    });
    
});