/// <reference types="cypress" />

describe('Logging in',()=>{
    beforeEach(() =>{
        cy.clearCookies();
        cy.visit('http://localhost:8100')
    })
      
    it('tries to log in with incorrect email', ()=>{
        cy.get('#loginEmail').type('brent@mweb.com')
        cy.get('#loginPassword').type('Password#1')
        cy.get('#login').click()
        cy.url().should('eq','http://localhost:8100/login')
    })

    it('tries to log in with incorrect email', ()=>{
      cy.get('#loginEmail').type('brentmweb.com')
      cy.get('#loginPassword').type('Password#1')
      // cy.get('#login').should('#login.ion-color.ion-color-primary.md.button.button-block.button-outline.button-disabled.ion-activatable.ion-focusable.hydrated')
      // cy.get('loginForm.valid').should('eq','false')
    })

    it('tries to log in with incorrect password', ()=>{
        cy.get('#loginEmail').type('brent@mweb.com')
        cy.get('#loginPassword').type('Password#123')
        cy.get('#login').click()
        cy.url().should('eq','http://localhost:8100/login')
    })

    it('Tries to log in with a to small password( char < 9)',()=>{
      cy.get('#loginEmail').type('brenton.stroberg@yahoo.co.za')
      cy.get('#loginPassword').type('Password')
      !cy.get('#login').click()
      // cy.url().should('eq','')
    })

    // it('Tries to log in with a non email email (brent)',()=>{
    //     cy.get('#loginEmail').type('brent')
    //     cy.get('#loginPassword').type('Password')
    //     cy.get('#login').should('eq','<ion-button#login.ion-color.ion-color-primary.md.button.button-block.button-outline.button-disabled.ion-activatable.ion-focusable.hydrated>')
    //     // cy.url().should('eq','')
    //   })

    it('logs in with the correct email and password', ()=>{
        cy.get('#loginEmail').type('brenton.stroberg@yahoo.co.za')
        cy.get('#loginPassword').type('Password#1')
        cy.get('#login').click()
        cy.url().should('eq','http://localhost:8100/home')
    })
});

describe('Registering a new user', ()=>{

});