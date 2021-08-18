/// <reference types="cypress" />

describe("testing the home workflow without logging in", () => {
    
    before(() =>{
        cy.clearCookies();
        cy.visit('http://localhost:8100');
        cy.get('#loginEmail').type('brenton.stroberg@yahoo.co.za')
        cy.get('#loginPassword').type('Password#1')
        cy.get('#login').click()
        cy.url().should('eq','http://localhost:8100/home');
    });

    it('',()=>{

    })
});