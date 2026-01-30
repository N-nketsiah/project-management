// cypress/e2e/theme/dark-mode.cy.ts
describe('Dark Mode Theme Toggle', () => {
  beforeEach(() => {
    cy.login('demo@taskflow.com', 'demo123');
    cy.visit('/dashboard');
  });

  it('should toggle dark mode', () => {
    // Check initial theme (assuming light mode)
    cy.get('html').should('not.have.class', 'dark');

    // Click theme toggle
    cy.get('button[aria-label*="dark mode"]').click();

    // Verify dark mode applied
    cy.get('html').should('have.class', 'dark');

    // Toggle back to light mode
    cy.get('button[aria-label*="light mode"]').click();
    cy.get('html').should('not.have.class', 'dark');
  });

  it('should persist theme preference', () => {
    // Enable dark mode
    cy.get('button[aria-label*="dark mode"]').click();
    cy.get('html').should('have.class', 'dark');

    // Reload page
    cy.reload();

    // Verify dark mode persists
    cy.get('html').should('have.class', 'dark');
  });

  it('should apply dark styles to components', () => {
    cy.get('button[aria-label*="dark mode"]').click();

    // Check navbar has dark background
    cy.get('nav').should('have.class', 'dark:bg-gray-800');

    // Check cards have dark background
    cy.get('.bg-white').should('have.class', 'dark:bg-gray-800');
  });
});
