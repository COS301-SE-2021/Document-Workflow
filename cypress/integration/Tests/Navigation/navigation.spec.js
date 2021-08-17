/// <reference types="cypress" />

describe("testing navigation without logging in", () => {
  beforeEach(() => {
    cy.clearCookies();
  });

  it("url with no route", () => {
    cy.visit("http://localhost:8100");
    cy.url().should("eq", "http://localhost:8100/login");
  });

  it("url with login route", () => {
    cy.visit("http://localhost:8100/login");
    cy.url().should("eq", "http://localhost:8100/login");
  });

  it("url tries with different routes(home)", () => {
    cy.visit("http://localhost:8100/documentView");
    cy.url().should("eq", "http://localhost:8100/login");
  });

  it("url tries with different routes(home)", () => {
    cy.visit("http://localhost:8100/home");
    cy.url().should("eq", "http://localhost:8100/login");
  });

  it("url tries with different routes(userProfile)", () => {
    cy.visit("http://localhost:8100/userProfile");
    cy.url().should("eq", "http://localhost:8100/login");
  });

  it("url tries with different routes(archive)", () => {
    cy.visit("http://localhost:8100/archive");
    cy.url().should("eq", "http://localhost:8100/login");
  });
});

describe("Navigation when user is logged in", () => {
  beforeEach(() => {
    cy.clearCookies();
    cy.visit("http://localhost:8100");
    // cy.get("#loginEmail").type("brenton.stroberg@yahoo.co.za");
    // cy.get("#loginPassword").type("Password#1");
    cy.get("#login").click();
    cy.wait(3000);
  });

  it("Navigating to home page", () => {
    cy.visit("http://localhost:8100/home");
    cy.url().should("eq", "http://localhost:8100/home");
  });

  it("Navigating to documentView page", () => {
    cy.visit("http://localhost:8100/home/documentView");
    cy.url().should("eq", "http://localhost:8100/home/documentView");
  });

  it("Navigating to profile page", () => {
    cy.visit("http://localhost:8100/home/userProfile");
    cy.url().should("eq", "http://localhost:8100/home/userProfile");
  });

  it("Navigating to workflowEdit page", () => {
    cy.visit("http://localhost:8100/home/workflowEdit");
    cy.url().should("eq", "http://localhost:8100/home/workflowEdit");
  });

  //todo testing of navigation will be done in their own files workflowEdit and documentEdit  

  it("Navigating to documentEdit page", () => {
    cy.visit("http://localhost:8100/home/documentEdit");
    cy.url().should("eq", "http://localhost:8100/home/documentEdit");
  });

  it("Navigating to addWorkflow page", () => {
    cy.visit("http://localhost:8100/home/addWorkflow");
    cy.url().should("eq", "http://localhost:8100/home/addWorkflow");
  });
  

 
  // it("navigating to archive", () => {
  //   cy.visit("http://localhost:8100/home/archive");
  //   cy.url().should("eq", "http://localhost:8100/archive");
  // });

  // it("navigating to view document", () => {
  //   cy.visit("http://localhost:8100/home/documentView");
  //   cy.url().should("eq", "http://localhost:8100/documentView");
  // });

  // it("navigating to home", () => {
  //   cy.visit("http://localhost:8100/home");
  //   cy.url().should("eq", "http://localhost:8100/home");
  // });
});
