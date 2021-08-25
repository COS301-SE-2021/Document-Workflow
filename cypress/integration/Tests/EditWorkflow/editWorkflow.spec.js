describe("testing the edit workflow functionality", () => {
  before(() => {
    cy.visit("http://localhost:8100");
    cy.get("#loginEmail").type("brenton.stroberg@yahoo.co.za");
    cy.get("#loginPassword").type("Password#1");
    cy.get("#login").click();
    cy.url().should("eq", "http://localhost:8100/home");
    cy.wait(8000);
  });

  it("Navigate to the edit document page preform edits", () => {
    cy.get(
      ":nth-child(5) > ion-reorder.md > ion-card.md > .header-md > .fab-horizontal-end > :nth-child(1)"
    ).click();
    cy.get(
      ":nth-child(5) > ion-reorder.md > ion-card.md > .header-md > .fab-horizontal-end > .fab-list-side-down > :nth-child(2) > .md"
    ).click();
    cy.wait(3000);
    cy.url().should(
      "eq",
      "http://localhost:8100/home/workflowEdit;workflowId=611d183d638b843894a09cb9"
    );

    cy.get(
      ':nth-child(2) > [style="margin: 5px; padding: 5px; border-width: 4px; border-style: solid; border-radius: 15px; border-color: #002060;"] > [sizexs="12"] > ion-row.md > [sizexs="2"] > .md'
    ).click();
    cy.get(
      ':nth-child(2) > [sizexs="10"] > .item-interactive > .ng-untouched > .native-input'
    ).clear();
    cy.get(
      ':nth-child(2) > [sizexs="10"] > .item-interactive > .ng-untouched > .native-input'
    ).type("brenton.stroberg@yahoo.co.za");
    cy.get(
      ':nth-child(2) > [sizexs="10"] > .item-interactive > .ng-untouched > .native-input'
    ).should("have.value", "brenton.stroberg@yahoo.co.za");

    cy.get(':nth-child(3) > [style="margin: 5px; padding: 5px; border-width: 4px; border-style: solid; border-radius: 15px; border-color: #002060;"] > [sizexs="12"] > ion-row.md > [sizexs="4"] > .md').click();// deletes

    cy.get("div > ion-grid.md > ion-row.md > :nth-child(1) > .md").click();
    cy.wait(10000);
    cy.get('ion-card-title').eq(4).should('contain','Brents Workflow for Testing cypress');
  });
});

describe("testing the edit workflow functionality again", () => {
  before(() => {
    cy.visit("http://localhost:8100");
    cy.get("#loginEmail").type("brenton.stroberg@yahoo.co.za");
    cy.get("#loginPassword").type("Password#1");
    cy.get("#login").click();
    cy.url().should("eq", "http://localhost:8100/home");
    cy.wait(8000);
  });
  it("will edit the file back to orginallity", () => {
    cy.get(
      ":nth-child(5) > ion-reorder.md > ion-card.md > .header-md > .fab-horizontal-end > :nth-child(1)"
    ).click();
    cy.get(
      ":nth-child(5) > ion-reorder.md > ion-card.md > .header-md > .fab-horizontal-end > .fab-list-side-down > :nth-child(2) > .md"
    ).click();
    cy.url().should(
      "eq",
      "http://localhost:8100/home/workflowEdit;workflowId=611d183d638b843894a09cb9"
    );

    cy.get(
      ':nth-child(2) > [style="margin: 5px; padding: 5px; border-width: 4px; border-style: solid; border-radius: 15px; border-color: #002060;"] > [sizexs="12"] > ion-row.md > [sizexs="2"] > .md'
    ).click();
    cy.get(
      ':nth-child(2) > [sizexs="10"] > .item-interactive > .ng-untouched > .native-input'
    ).clear();
    cy.get(
      ':nth-child(2) > [sizexs="10"] > .item-interactive > .ng-untouched > .native-input'
    ).type("timothyhill202@gmail.com");
    cy.get(
      ':nth-child(2) > [sizexs="10"] > .item-interactive > .ng-untouched > .native-input'
    ).should("have.value", "timothyhill202@gmail.com");

    cy.get(
      ".ng-invalid > ion-card.md > .card-content-md > ion-grid.md > :nth-child(3) > :nth-child(1) > .md"
    ).click();

    cy.get(
      ':nth-child(3) > [style="margin: 5px; padding: 5px; border-width: 4px; border-style: solid; border-radius: 15px; border-color: #002060;"] > [sizexs="12"] > ion-row.md > [sizexs="8"] > .item-interactive > .ng-untouched > .textarea-wrapper > .native-textarea'
    ).type("This is for phase description");

    cy.get(':nth-child(3) > [style="margin: 5px; padding: 5px; border-width: 4px; border-style: solid; border-radius: 15px; border-color: #002060;"] > [sizexs="12"] > ion-row.md > [sizexs="2"] > .md').click();
    cy.get(':nth-child(2) > [sizexs="10"] > .item-interactive > .ng-untouched > .native-input').type('brenton.stroberg@yahoo.co.za')

    cy.get(':nth-child(3) > [style="margin: 5px; padding: 5px; border-width: 4px; border-style: solid; border-radius: 15px; border-color: #002060;"] > :nth-child(2) > :nth-child(2) > [sizexs="12"] > .item-interactive > .ng-untouched').click();
    cy.get('#alert-input-2-0 > .alert-button-inner > .alert-radio-label').click();//select signer
    cy.get('.alert-button-group > :nth-child(2) > .alert-button-inner').click();//ok
    cy.get(':nth-child(3) > [style="margin: 5px; padding: 5px; border-width: 4px; border-style: solid; border-radius: 15px; border-color: #002060;"] > :nth-child(2) > :nth-child(3) > :nth-child(2) > .md').click();
    cy.wait(13000);
    
    cy.get('ion-grid.md > :nth-child(4) > :nth-child(2) > .md').click();
    cy.get('div > ion-grid.md > ion-row.md > :nth-child(1) > .md').click();
    cy.wait(10000);
    cy.get('ion-card-title').eq(4).should('contain','Brents Workflow for Testing cypress');
  });
});
