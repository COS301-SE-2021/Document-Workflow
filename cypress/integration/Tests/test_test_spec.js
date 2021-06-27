/// <reference types="cypress" />

// unit testing
describe('testing navigation without logging in', () => {
    
    it('url with no route', () =>{
      cy.visit('http://localhost:8100')
      cy.url().should('eq','http://localhost:8100/login')
    })

    it('url with login route',() =>{
        cy.visit('http://localhost:8100/login')
        cy.url().should('eq','http://localhost:8100/login')
    })

    it('url tries with different routes(documentView)', () =>{
        cy.visit('http://localhost:8100/documentView')
        cy.url().should('eq','http://localhost:8100/login')
    })

    
    it('url tries with different routes(home)', () =>{
        cy.visit('http://localhost:8100/home')
        cy.url().should('eq','http://localhost:8100/login')
    })

    
    it('url tries with different routes(userProfile)', () =>{
        cy.visit('http://localhost:8100/userProfile')
        cy.url().should('eq','http://localhost:8100/login')
    })

    it('url tries with different routes(archive)', () =>{
        cy.visit('http://localhost:8100/archive')
        cy.url().should('eq','http://localhost:8100/login')
    })
})

//intergration
describe('Logging in',()=>{
    beforeEach(() =>{
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
      cy.get('#login').click({force: true})
      cy.url().should('eq','http://localhost:8100/login')
    })

    it('Tries to log in with a to small password( char < 9)',()=>{
      cy.get('#loginEmail').type('brenton.stroberg@yahoo.co.za')
      cy.get('#loginPassword').type('Passwor')
      cy.get('#login').click({force: true})
      cy.url().should('eq','http://localhost:8100/login')
    })

    it('logs in with the correct email and password', ()=>{
        cy.get('#loginEmail').type('brenton.stroberg@yahoo.co.za')
        cy.get('#loginPassword').type('Password#1')
        cy.get('#login').click()
        cy.url().should('eq','http://localhost:8100/home')
    })
})

//intergration
describe('Navigation when user is logged in', ()=>{
  beforeEach(() =>{
    cy.visit('http://localhost:8100')
    cy.get('#loginEmail').type('brenton.stroberg@yahoo.co.za')
    cy.get('#loginPassword').type('Password#1')
    cy.get('#login').click()
    cy.get('body').click(0,0);
    cy.wait(1000)
    cy.get('body').click(0,0);
    cy.get('body').click(0,0);
})

  it('Navigating to profile page', () =>{
    cy.visit('http://localhost:8100/userProfile')
    cy.url().should('eq','http://localhost:8100/userProfile')
  })

  it('Navigating to archive', () =>{
    cy.visit('http://localhost:8100/archive')
    cy.url().should('eq','http://localhost:8100/archive')
  })

  it('Navigating to view document', () =>{
    cy.visit('http://localhost:8100/documentView')
    cy.url().should('eq','http://localhost:8100/documentView')
  })

  it('Navigating to home', () =>{
    cy.visit('http://localhost:8100/home')
    cy.url().should('eq','http://localhost:8100/home')
  })
})

describe('Testing the loading workflow', ()=>{
  beforeEach(()=>{
    cy.visit('http://localhost:8100')
    cy.get('#loginEmail').type('brenton.stroberg@yahoo.co.za')
    cy.get('#loginPassword').type('Password#1')
    cy.get('#login').click()
    cy.wait(1500)
    cy.get('body').click(0,0);
    cy.get('body').click(0,0);
    cy.get('body').click(0,0);
  })

  it('Getting the form name',()=>{
    cy.get('ion-card-title').contains( 'testing document')
  })

  it('Getting owner', ()=>{
    cy.get('ion-card-subtitle').contains('Owner of workflow: brenton.stroberg@yahoo.co.za ')
  })
})
  