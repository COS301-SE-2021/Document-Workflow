describe("testing the edit workflow functionality", () => {
  before(() => {
    cy.clearCookies();
    cy.visit("http://localhost:8100");
    cy.get("#loginEmail").type("brenton.stroberg@yahoo.co.za");
    cy.get("#loginPassword").type("Password#1");
    cy.get("#login").click();
    cy.url().should("eq", "http://localhost:8100/home");
    cy.wait(8000);
  });

  it("Navigate to the edit document page", () => {
    cy.get(
      ":nth-child(5) > ion-reorder.md > ion-card.md > .header-md > .fab-horizontal-end > :nth-child(1)"
    ).click();
    cy.get(
      ":nth-child(5) > ion-reorder.md > ion-card.md > .header-md > .fab-horizontal-end > .fab-list-side-down > :nth-child(2) > .md"
    ).click();
    cy.wait(3000);
    cy.url().should("eq", "http://localhost:8100/home/workflowEdit;workflowId=611d183d638b843894a09cb9");
  
  });

  it("edit the description of the workflow", () =>{
    cy.get('ion-textarea').eq(0).type(" part of the test");
    cy.get('ion-textarea').eq(0).should('contain', 'This workflow is for testing purposes only please do not edit/or delete it part of the test');
  });

  it('will open phase and change phase description',  ()=>{
    cy.get(':nth-child(2) > [style="margin: 5px; padding: 5px; border-width: 4px; border-style: solid; border-radius: 15px; border-color: #002060;"] > [sizexs="12"] > ion-row.md > [sizexs="2"] > .md').click();
    cy.get(':nth-child(2) > [sizexs="10"] > .item-interactive > .ng-untouched > .native-input').clear();
    cy.get(':nth-child(2) > [sizexs="10"] > .item-interactive > .ng-untouched > .native-input').type("brenton.stroberg@yahoo.co.za");
    cy.get(':nth-child(2) > [sizexs="10"] > .item-interactive > .ng-untouched > .native-input').should('have.value','brenton.stroberg@yahoo.co.za');
  });

  it("will delete a phase and save the changes",()=>{
    cy.get(':nth-child(3) > [style="margin: 5px; padding: 5px; border-width: 4px; border-style: solid; border-radius: 15px; border-color: #002060;"] > [sizexs="12"] > ion-row.md > [sizexs="4"] > .md').click();
    cy.get('ion-grid.md > :nth-child(4) > :nth-child(2) > .md').click();
    cy.wait(3000);
  
    cy.get('div > ion-grid.md > ion-row.md > :nth-child(1) > .md').click();
  })  

});
