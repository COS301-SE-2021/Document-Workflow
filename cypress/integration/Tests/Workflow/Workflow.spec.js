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
    });

    it('check is workflow exists',()=>{
      cy.get('ion-card-title').eq(1).should('contain', 'Multiphase Workflow');
    });

    it('checks if owner is correct', ()=>{
      cy.get('ion-card-subtitle').eq(1).should('contain', 'Owner of the workflow: brenton.stroberg@yahoo.co.za');
    });

    it('checks for the correct number of phases', ()=>{
      cy.get('ion-card').eq(1).get('h1').eq(4).should('contain', 'Phase 3')
    });

    
});