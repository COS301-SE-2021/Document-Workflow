// AddWorkflow.spec.js created with Cypress
//
// Start writing your Cypress tests below!
// If you're unfamiliar with how Cypress works,
// check out the link below and learn how to write your first test:
// https://on.cypress.io/writing-first-test

const { isUnionTypeNode } = require("typescript");

describe("testing the add workflow functionality", () => {
  before(() => {
    cy.clearCookies();
    cy.visit("http://localhost:8100");
    cy.get("#loginEmail").type("brenton.stroberg@yahoo.co.za");
    cy.get("#loginPassword").type("Password#1");
    cy.get("#login").click();
    cy.url().should("eq", "http://localhost:8100/home");
    cy.wait(4000);
  });

  it("input the data", ()=>{
      cy.visit('http://localhost:8100/home/addWorkflow');
      cy.get('input.native-input').type('This is a document name',{force: true});
      cy.get('.native-textarea').type("This is the workflow description");
      cy.get('#uploadFile').click();
      cy.get('#uploadFile').attachFile('Timesheet-Template.pdf');
      cy.wait(10000);
      cy.get("#changeOver").click();

      cy.get('ion-textarea').eq(0).type('this is a phase text');
      cy.get('ion-input').eq(0).type('brenton.stroberg@yahoo.co.za');

      cy.get('.in-item').eq(0).click();
      cy.get('#alert-input-3-0 > .alert-button-inner > .alert-radio-label').eq(0).click();
      cy.get('.alert-button-group > :nth-child(2)').click();

      cy.get('ion-button').eq(1).click();
      cy.wait(10000);

      // cy.get('ion-icon').eq(0).click();
      cy.get(':nth-child(4) > .ion-color').eq(0).click();
      cy.wait(14000)

      cy.get('ion-card-title').eq(3).should('contain', 'This is a document name');
  });
});

// describe("testing the delete workflow functionality", () => {
//     before(() =>{
//         cy.clearCookies();
//         cy.visit('http://localhost:8100');
//         cy.get('#loginEmail').type('brenton.stroberg@yahoo.co.za')
//         cy.get('#loginPassword').type('Password#1')
//         cy.get('#login').click()
//         cy.url().should('eq','http://localhost:8100/home');
//         cy.wait(8000);
//     });
// });

describe("testing the delete workflow functionality", () => {
  before(() => {
    cy.clearCookies();
    cy.visit("http://localhost:8100");
    cy.get("#loginEmail").type("brenton.stroberg@yahoo.co.za");
    cy.get("#loginPassword").type("Password#1");
    cy.get("#login").click();
    cy.url().should("eq", "http://localhost:8100/home");
    cy.wait(8000);
  });

  it("Should delete the created workflow", () => {
    cy.get(
      ":nth-child(4) > ion-reorder.md > ion-card.md > .header-md > ion-grid.md > ion-row.md > .fab-horizontal-end > :nth-child(1)"
    ).click();
    cy.get(':nth-child(4) > ion-reorder.md > ion-card.md > .header-md > ion-grid.md > ion-row.md > .fab-horizontal-end > .fab-list-side-down > :nth-child(3) > span').click();
    // cy.get(
    //   ":nth-child(4) > ion-reorder.md > ion-card.md > .header-md > ion-grid.md > ion-row.md > .fab-horizontal-end > .fab-list-side-down > :nth-child(3) > .md"
    // ).click();
    cy.wait(250);
    cy.get("div > ion-grid.md > ion-row.md > :nth-child(1)").click();
    cy.get("div > ion-grid.md > ion-row.md > :nth-child(1) > .md").click();
    cy.wait(10000);
  });
});

describe("testing the delete workflow functionality", () => {
  before(() => {
    cy.clearCookies();
    cy.visit("http://localhost:8100");
    cy.get("#loginEmail").type("brenton.stroberg@yahoo.co.za");
    cy.get("#loginPassword").type("Password#1");
    cy.get("#login").click();
    cy.url().should("eq", "http://localhost:8100/home");
    cy.wait(8000);
  });

  it("Check to see if it has added correctly", () => {
    cy.get("ion-card-title")
      .eq(3)
      .should("to.not.contain", "This is a document name");
  });
});
