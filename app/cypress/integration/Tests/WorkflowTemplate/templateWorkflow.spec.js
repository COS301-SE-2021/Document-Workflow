describe("testing the edit workflow functionality", () => {
  before(() => {
    cy.visit("http://localhost:8100");
    cy.get("#loginEmail").type("brenton.stroberg@yahoo.co.za");
    cy.get("#loginPassword").type("Password#1");
    cy.get("#login").click();
    cy.wait(8000);
    cy.url().should("eq", "http://localhost:8100/home");

  });

  it("testing adding a workflow using template a template", () => {
    cy.visit("http://localhost:8100/home/workflowTemplate");
    cy.wait(4000);
    cy.url().should(
      "eq",
      "http://localhost:8100/home/workflowTemplate"
    );
    cy.get(':nth-child(1) > [sizemd="4"] > :nth-child(2)').click();
    cy.wait(8000);
    cy.get('.native-input').type(" 2.0");
    cy.get('.fab-horizontal-end > .md').click();
    cy.get(':nth-child(2) > [style="margin: 5px; padding: 5px; border-width: 4px; border-style: solid; border-radius: 15px; border-color: #002060;"] > :nth-child(1) > ion-row.md > :nth-child(4) > .md').click();

    cy.get(':nth-child(2) > :nth-child(2) > :nth-child(2) > .md').click();
  });
});

// describe("testing the edit workflow functionality again", () => {
//   before(() => {
//     cy.visit("http://localhost:8100");
//     cy.get("#loginEmail").type("brenton.stroberg@yahoo.co.za");
//     cy.get("#loginPassword").type("Password#1");
//     cy.get("#login").click();
//     cy.url().should("eq", "http://localhost:8100/home");
//     cy.wait(8000);

//   });
  // it("will edit the file back to orginallity", () => {
  //   cy.visit("http://localhost:8100/home/workflowEdit;workflowId=612fb45b6582dd1b700bc147");
  //   cy.wait(4000);
  //   cy.url().should(
  //     "eq",
  //     "http://localhost:8100/home/workflowEdit;workflowId=612fb45b6582dd1b700bc147"
  //   );

  //   cy.get('[sizexs="2"] > .md').click();
  //   cy.get('[sizexs="9"] > .item-interactive > .ng-pristine > .native-input').clear().type("timothyhill202@gmail.com",{force:true}).should("have.value", "timothyhill202@gmail.com");



  //      cy.get(':nth-child(4) > :nth-child(2) > .md').click();
  //   cy.get('div > ion-grid.md > ion-row.md > :nth-child(1) > .md').click();
  //   cy.wait(10000);
  //   cy.get('ion-card-title').eq(0).should('contain','brents tester for testing history');
  // });
// });
