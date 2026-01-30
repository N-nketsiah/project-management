// cypress/e2e/responsive/mobile.cy.ts
describe('Mobile Responsiveness', () => {
  beforeEach(() => {
    cy.login('demo@taskflow.com', 'demo123');
  });

  it('should display correctly on mobile viewport', () => {
    cy.viewport('iphone-x');
    cy.visit('/dashboard');

    // Check mobile layout
    cy.get('.sm\\:flex').should('not.be.visible');
    cy.contains('Dashboard').should('be.visible');
  });

  it('should display correctly on tablet viewport', () => {
    cy.viewport('ipad-2');
    cy.visit('/dashboard');

    cy.contains('Dashboard').should('be.visible');
    cy.get('.md\\:grid-cols-2').should('be.visible');
  });

  it('should display correctly on desktop viewport', () => {
    cy.viewport(1920, 1080);
    cy.visit('/dashboard');

    cy.get('.lg\\:grid-cols-4').should('be.visible');
    cy.contains('Dashboard').should('be.visible');
  });
});
