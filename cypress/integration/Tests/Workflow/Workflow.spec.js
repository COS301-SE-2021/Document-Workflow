/// <reference types="cypress" />

describe("testing the home workflow without logging in", () => {
    
    before(() =>{
        cy.clearCookies();
        cy.visit('http://localhost:8100');
        cy.get('#loginEmail').type('brenton.stroberg@yahoo.co.za')
        cy.get('#loginPassword').type('Password#1')
        cy.get('#login').click()
        cy.url().should('eq','http://localhost:8100/home');
        cy.wait(8000);
        cy.get('ion-popover').click();
    });

    it('check is workflow exists',()=>{
      cy.get('ion-card-title').eq(4).should('contain', 'Brents Workflow for Testing cypress');
    });

    it('checks if owner is correct', ()=>{
      cy.get('ion-card-subtitle').eq(4).should('contain', 'Owner of the workflow: brenton.stroberg@yahoo.co.za');
    });

    it('checks for the correct number of phases', ()=>{
      cy.get('ion-card').eq(4).get('h1').eq(11).should('contain', 'Phase 3')
    });

    
});