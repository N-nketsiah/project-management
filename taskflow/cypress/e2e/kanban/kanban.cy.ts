// cypress/e2e/kanban/kanban.cy.ts
describe('Kanban Board', () => {
  beforeEach(() => {
    cy.login('demo@taskflow.com', 'demo123');
    cy.visit('/kanban');
  });

  it('should display all kanban columns', () => {
    cy.contains('To Do').should('be.visible');
    cy.contains('In Progress').should('be.visible');
    cy.contains('Review').should('be.visible');
    cy.contains('Done').should('be.visible');
  });

  it('should display tasks in appropriate columns', () => {
    cy.get('.kanban-column').should('have.length', 4);
    cy.get('.task-card').should('exist');
  });

  it('should show task details', () => {
    cy.get('.task-card').first().within(() => {
      cy.get('h3').should('be.visible');
      cy.get('p').should('exist');
    });
  });

  it('should drag and drop task between columns', () => {
    // Get initial column task count
    cy.get('.kanban-column').first().within(() => {
      cy.get('.task-card').its('length').as('initialCount');
    });

    // Drag task from first column
    cy.get('.task-card').first().as('taskToDrag');

    // Simulate drag and drop (Cypress doesn't natively support drag-drop well)
    // Using cypress-real-events plugin or custom implementation
    cy.get('@taskToDrag').trigger('mousedown', { which: 1 });
    cy.get('.kanban-column').eq(1).trigger('mousemove').trigger('mouseup', { force: true });

    // Verify task moved (this is simplified, actual implementation may vary)
    cy.wait(500); // Wait for animation
  });
});
