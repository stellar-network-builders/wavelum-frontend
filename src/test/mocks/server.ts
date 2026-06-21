import { setupServer } from 'msw/node';
import { handlers } from './handlers';

/**
 * MSW server instance configured with the application's request handlers.
 * Use `server.use(...)` to add scenario-specific handlers in individual tests.
 */
export const server = setupServer(...handlers);
