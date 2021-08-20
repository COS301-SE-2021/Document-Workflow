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

    it('logs in with the correct email and password', ()=>{
        cy.get('#loginEmail').type('brenton.stroberg@yahoo.co.za')
        cy.get('#loginPassword').type('Password#1')
        cy.get('#login').click()
        cy.url().should('eq','http://localhost:8100/home')
    })
});

describe('Registering a new user', ()=>{
    beforeEach(() =>{
        cy.clearCookies();
        cy.visit('http://localhost:8100');
        cy.get('#changeover').click();
    })

    it('Registering a user',()=>{
        cy.get('#firstname').type("Brenton");
        cy.get('#lastname').type("Stroberg");
        cy.get('#initials').type("BP");
        cy.get('#email').type("u17015741@tuks.co.za");
        cy.get('#phoneNumber').type("0763398714");
        cy.get('#password').type("Password#1");
        cy.get('#confirmPassword').type("Password#1");
        cy.get("#addSignature").click();
        cy.get(".action-sheet-group>:nth-child(2)").click();
        cy.wait(500);
        cy.get(".signature-pad-canvas").click()
        cy.get('#save').click();
        cy.get('#done').click();
        cy.get('#register').click();
        cy.get('ion-row.md > :nth-child(1) > .md').eq(1).click();
    });
});