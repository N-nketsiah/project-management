// cypress/e2e/dashboard/dashboard.cy.ts
describe('Dashboard Page', () => {
  beforeEach(() => {
    cy.login('demo@taskflow.com', 'demo123');
    cy.visit('/dashboard');
  });

  it('should display dashboard statistics', () => {
    cy.contains('Total Tasks').should('be.visible');
    cy.contains('Completed').should('be.visible');
    cy.contains('In Progress').should('be.visible');
    cy.contains('Completion Rate').should('be.visible');
  });

  it('should display task status chart', () => {
    cy.contains('Task Status Distribution').should('be.visible');
    cy.get('canvas').should('exist');
  });

  it('should display priority breakdown chart', () => {
    cy.contains('Priority Breakdown').should('be.visible');
    cy.get('canvas').should('have.length.at.least', 1);
  });

  it('should display recent tasks table', () => {
    cy.contains('Recent Tasks').should('be.visible');
    cy.get('table').should('be.visible');
    cy.get('tbody tr').should('have.length.at.least', 1);
  });

  it('should navigate to kanban from navbar', () => {
    cy.contains('Kanban').click();
    cy.url().should('include', '/kanban');
    cy.contains('Kanban Board').should('be.visible');
  });
});
