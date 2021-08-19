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

    it("input the data", ()=>{
        cy.get('#workflowName').type('This is a document name');
        cy.get('#workflowDescription').type("This is the workflow description");
        cy.wait(10000);
        cy.get("#changeOver").click();

        cy.get('ion-textarea').eq(0).type('this is a phase text');
        cy.get('ion-input').eq(0).type('brenton.stroberg@yahoo.co.za');

        cy.get('ion-select').eq(0).click();
        cy.get('#alert-input-1-0').eq(0).click();
        cy.get('.alert-button-group > :nth-child(2)').click();

        cy.get('ion-button').eq(1).click();
        cy.wait(10000);

        cy.wait(5000);
        cy.get('ion-icon').eq(0).click();
        cy.get('ion-button').eq(1).click();

    });
    
});