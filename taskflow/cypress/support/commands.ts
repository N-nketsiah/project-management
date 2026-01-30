/// <reference types="cypress" />

// cypress/support/commands.ts
// Custom Cypress commands

declare global {
  namespace Cypress {
    interface Chainable {
      login(email: string, password: string): void;
      createTask(task: { title: string; description: string; priority: string }): void;
      getByTestId(testId: string): Chainable;
    }
  }
}

export {};

Cypress.Commands.add('login', (email: string, password: string) => {
  cy.visit('/login');
  cy.get('input[type="email"]').type(email);
  cy.get('input[type="password"]').type(password);
  cy.get('button[type="submit"]').click();
  cy.url().should('include', '/dashboard');
});

Cypress.Commands.add('createTask', (task: { title: string; description: string; priority: string }) => {
  cy.get('[data-testid="create-task-btn"]').click();
  cy.get('[data-testid="task-title"]').type(task.title);
  cy.get('[data-testid="task-description"]').type(task.description);
  cy.get('[data-testid="task-priority"]').select(task.priority);
  cy.get('[data-testid="save-task-btn"]').click();
});

Cypress.Commands.add('getByTestId', (testId: string) => {
  return cy.get(`[data-testid="${testId}"]`);
});
