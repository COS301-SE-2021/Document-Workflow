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
        
    });

    it("input the data", ()=>{
        cy.visit('http://localhost:8100/home/addWorkflow');
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

        cy.get('ion-icon').eq(0).click();
        cy.get('ion-button').eq(1).click();
        cy.wait(14000)

        cy.get('ion-card-title').eq(6).should('contain', 'This is a document name');
    });
});

describe("testing the delete workflow functionality", () => {   
    before(() =>{
        cy.clearCookies();
        cy.visit('http://localhost:8100');
        cy.get('#loginEmail').type('brenton.stroberg@yahoo.co.za')
        cy.get('#loginPassword').type('Password#1')
        cy.get('#login').click()
        cy.url().should('eq','http://localhost:8100/home');
        cy.wait(8000);
    });
});

describe("testing the delete workflow functionality", () => {   
    before(() =>{
        cy.clearCookies();
        cy.visit('http://localhost:8100');
        cy.get('#loginEmail').type('brenton.stroberg@yahoo.co.za')
        cy.get('#loginPassword').type('Password#1')
        cy.get('#login').click()
        cy.url().should('eq','http://localhost:8100/home');
        cy.wait(8000);
    });

    it("Should delete the created workflow", ()=>{
        cy.get(':nth-child(7) > ion-reorder.md > ion-card.md > .header-md > .fab-horizontal-end > :nth-child(1) > .md').click();
        cy.get(':nth-child(7) > ion-reorder.md > ion-card.md > .header-md > .fab-horizontal-end > .fab-list-side-down > :nth-child(3) > .md').click();
        cy.wait(250);
        cy.get('div > ion-grid.md > ion-row.md > :nth-child(1)').click();
        cy.get('div > ion-grid.md > ion-row.md > :nth-child(1) > .md').click();
        cy.wait(10000);
    });
});

describe("testing the delete workflow functionality", () => {   
    before(() =>{
        cy.clearCookies();
        cy.visit('http://localhost:8100');
        cy.get('#loginEmail').type('brenton.stroberg@yahoo.co.za')
        cy.get('#loginPassword').type('Password#1')
        cy.get('#login').click()
        cy.url().should('eq','http://localhost:8100/home');
        cy.wait(8000);
    });

    it("Check to see if it has added correctly",()=>{
        cy.get('ion-card-title').eq(6).should('to.not.contain', 'This is a document name');
    });
});