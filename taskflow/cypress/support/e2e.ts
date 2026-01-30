// cypress/support/e2e.ts
// Custom commands and global configuration
import './commands';

// Prevent TypeScript errors
declare global {
  namespace Cypress {
    interface Chainable {
      login(email: string, password: string): Chainable<void>;
      createTask(task: {
        title: string;
        description: string;
        priority: string;
      }): Chainable<void>;
      getByTestId(testId: string): Chainable<JQuery<HTMLElement>>;
    }
  }
}
