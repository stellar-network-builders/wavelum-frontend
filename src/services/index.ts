/**
 * Services module barrel export.
 *
 * Feature modules import API clients and external service integrations
 * from here rather than creating their own instances.
 */
export { ApiClient, createSorobanClient } from './api';
export type { ApiClientConfig, ApiResponse, ApiError } from './api';
