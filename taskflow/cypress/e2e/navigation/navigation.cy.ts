// cypress/e2e/navigation/navigation.cy.ts
describe('Application Navigation', () => {
  beforeEach(() => {
    cy.login('demo@taskflow.com', 'demo123');
  });

  it('should navigate through all main pages', () => {
    // Dashboard
    cy.visit('/dashboard');
    cy.contains('Dashboard').should('be.visible');

    // Kanban
    cy.contains('Kanban').click();
    cy.url().should('include', '/kanban');
    cy.contains('Kanban Board').should('be.visible');

    // Tasks
    cy.contains('Tasks').click();
    cy.url().should('include', '/tasks');
    cy.contains('All Tasks').should('be.visible');

    // Back to Dashboard
    cy.contains('Dashboard').click();
    cy.url().should('include', '/dashboard');
  });

  it('should highlight active navigation link', () => {
    cy.visit('/dashboard');
    cy.contains('a', 'Dashboard').should('have.class', 'border-blue-500');

    cy.contains('Kanban').click();
    cy.contains('a', 'Kanban').should('have.class', 'border-blue-500');
  });

  it('should protect routes when not authenticated', () => {
    cy.clearLocalStorage();
    cy.visit('/dashboard');
    cy.url().should('include', '/login');
  });
});
