// profile.spec.js created with Cypress
//
// Start writing your Cypress tests below!
// If you're unfamiliar with how Cypress works,
// check out the link below and learn how to write your first test:
// https://on.cypress.io/writing-first-test

describe("Navigation when user is logged in", () => {
  beforeEach(() => {
    cy.clearCookies();
    cy.visit("http://localhost:8100");
    cy.get("#loginEmail").type("brenton.stroberg@yahoo.co.za");
    cy.get("#loginPassword").type("Password#1");
    cy.get("#login").click();
    cy.wait(5000);
    cy.visit("http://localhost:8100/home/userProfile");
  });

  it("Change the users name", () => {
    cy.wait(2000);
    cy.get(
      ":nth-child(1) > :nth-child(1) > .item-interactive > .ng-untouched > .native-input"
    )
      .clear({ force: true })
      .type("Brent", { force: true })
      .should("have.value", "Brent");
    cy.get(
      ":nth-child(1) > :nth-child(2) > .item-interactive > .ng-untouched > .native-input"
    )
      .clear({ force: true })
      .type("Strobe", { force: true })
      .should("have.value", "Strobe");
    cy.get("form.ng-dirty > .ion-color").click({force:true});
    cy.wait(3000);
  });

  it("Will check if the changes have been made", ()=>{
    cy.get(":nth-child(1) > :nth-child(1) > .item-interactive > .ng-untouched > .native-input").should("have.value", "Brent");
    cy.get(":nth-child(1) > :nth-child(2) > .item-interactive > .ng-untouched > .native-input").should("have.value", "Strobe");
  });

  it("will change back", ()=>{
    cy.wait (2000);
    cy.get(
      ":nth-child(1) > :nth-child(1) > .item-interactive > .ng-untouched > .native-input"
    )
      .clear({ force: true })
      .type("Brenton", { force: true })
      .should("have.value", "Brenton");
    cy.get(
      ":nth-child(1) > :nth-child(2) > .item-interactive > .ng-untouched > .native-input"
    )
      .clear({ force: true })
      .type("Stroberg", { force: true })
      .should("have.value", "Stroberg");
    cy.get("form.ng-dirty > .ion-color").click({force:true});
    cy.wait(3000);
  });

  it("Will check if the changes have been made", ()=>{
    cy.get(":nth-child(1) > :nth-child(1) > .item-interactive > .ng-untouched > .native-input").should("have.value", "Brenton");
    cy.get(":nth-child(1) > :nth-child(2) > .item-interactive > .ng-untouched > .native-input").should("have.value", "Stroberg");
    cy.wait(2000);
  });

  it("Block a user",()=>{
    cy.get(':nth-child(1) > ion-card.md > .card-content-md > :nth-child(3)').click({force:true});
    cy.wait(2000);
  });

  it("Unblock a user",()=>{
    cy.get('[style="width: 95%; margin: auto; text-align: center; align-items: center; margin-top: 20px; margin-bottom: 20px;"] > .card-content-md > ion-row.md > ion-col.md > ion-card.md > .button').click({force:true})
    cy.wait(2000);
  })

  it("will delete timothy", ()=>{
    cy.get(':nth-child(3) > ion-card.md > .card-content-md > :nth-child(2)').click({force:true})
    cy.wait(2000);
  });

  it('will add timothy', ()=>{
    cy.get('form.ng-untouched > .item-interactive > .ng-untouched > .native-input').type('timothyhill202@gmail.com',{force:true, multiple: true });
    cy.get('form.ng-untouched > .button').click({force:true, multiple: true });
    cy.wait(3000);
  })
});

describe("Navigation when user is logged in", () => {
  beforeEach(() => {
    cy.clearCookies();
    cy.visit("http://localhost:8100");
    cy.get("#loginEmail").type("timothyhill202@gmail.com");
    cy.get("#loginPassword").type("Password!123");
    cy.get("#login").click();
    cy.wait(5000);
    cy.visit("http://localhost:8100/home/userProfile");
  });

  it("accept a user",()=>{
    cy.wait (4000);
    cy.get('[style="width: 95%; margin: auto; text-align: center; align-items: center; margin-top: 20px;"] > .card-content-md > ion-row.md > ion-col.md > ion-card.md > :nth-child(2)').click({force:true})
    cy.wait(4000);
  });
});

describe("Navigation when user is logged in", () => {
  beforeEach(() => {
    cy.clearCookies();
    cy.visit("http://localhost:8100");
    cy.get("#loginEmail").type("brenton.stroberg@yahoo.co.za");
    cy.get("#loginPassword").type("Password#1");
    cy.get("#login").click();
    cy.wait(5000);
    cy.visit("http://localhost:8100/home/userProfile");
  });

  it(" is there timothy", ()=>{
    cy.wait (4000);
    cy.get(':nth-child(3) > ion-card.md > .card-content-md > :nth-child(2)').click({force:true})
  });
});
