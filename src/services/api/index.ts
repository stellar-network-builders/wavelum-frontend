/**
 * API client barrel — the Axios instance, the typed `http` helper, and the
 * runtime registration hooks for token / unauthorized / toast integration.
 */
export {
  apiClient,
  http,
  registerTokenGetter,
  registerUnauthorizedHandler,
  registerToastHandler,
} from './client';
