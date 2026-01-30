// cypress/e2e/auth/login.cy.ts
describe('Authentication Flow', () => {
  beforeEach(() => {
    cy.visit('/login');
  });

  it('should display login form', () => {
    cy.get('h1').should('contain', 'TaskFlow');
    cy.get('input[type="email"]').should('be.visible');
    cy.get('input[type="password"]').should('be.visible');
    cy.get('button[type="submit"]').should('be.visible');
  });

  it('should show validation errors for invalid inputs', () => {
    cy.get('button[type="submit"]').click();
    cy.get('input[type="email"]').then(($input) => {
      expect($input[0].validationMessage).to.not.be.empty;
    });
  });

  it('should login with valid credentials', () => {
    cy.get('input[type="email"]').type('demo@taskflow.com');
    cy.get('input[type="password"]').type('demo123');
    cy.get('button[type="submit"]').click();

    // Should redirect to dashboard
    cy.url().should('include', '/dashboard');
    cy.get('h1').should('contain', 'Dashboard');
  });

  it('should show error for invalid credentials', () => {
    cy.get('input[type="email"]').type('wrong@email.com');
    cy.get('input[type="password"]').type('wrongpassword');
    cy.get('button[type="submit"]').click();

    cy.contains('Invalid email or password').should('be.visible');
  });

  it('should logout successfully', () => {
    // Login first
    cy.login('demo@taskflow.com', 'demo123');

    // Logout
    cy.contains('Logout').click();
    cy.url().should('include', '/login');
  });
});
