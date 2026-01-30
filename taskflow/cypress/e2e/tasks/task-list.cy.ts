// cypress/e2e/tasks/task-list.cy.ts
describe('Task List with Search and Filters', () => {
  beforeEach(() => {
    cy.login('demo@taskflow.com', 'demo123');
    cy.visit('/tasks');
  });

  it('should display all tasks initially', () => {
    cy.contains('All Tasks').should('be.visible');
    cy.get('.bg-white.dark\\:bg-gray-800').should('have.length.at.least', 1);
  });

  it('should search tasks by title', () => {
    cy.get('input[placeholder="Search tasks..."]').type('Design');
    cy.wait(300); // Debounce
    cy.contains('Design').should('be.visible');
  });

  it('should filter tasks by status', () => {
    cy.contains('Status').parent().find('select').select('done');
    cy.get('.bg-white.dark\\:bg-gray-800').each(($task) => {
      cy.wrap($task).should('contain', 'done');
    });
  });

  it('should filter tasks by priority', () => {
    cy.contains('Priority').parent().find('select').select('high');
    cy.get('.bg-white.dark\\:bg-gray-800').each(($task) => {
      cy.wrap($task).should('contain', 'high');
    });
  });

  it('should show correct task count', () => {
    cy.contains(/\\d+ task\\(s\\) found/).should('be.visible');
  });

  it('should clear all filters', () => {
    // Apply filters
    cy.contains('Status').parent().find('select').select('done');
    cy.contains('Priority').parent().find('select').select('high');

    // Clear filters
    cy.contains('Clear all').click();

    // Verify filters reset
    cy.contains('Status').parent().find('select').should('have.value', '');
  });

  it('should show no results message when no tasks match', () => {
    cy.get('input[placeholder="Search tasks..."]').type('NonexistentTask12345');
    cy.contains('No tasks found').should('be.visible');
  });
});
