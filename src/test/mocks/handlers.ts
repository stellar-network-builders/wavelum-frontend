/**
 * MSW request handlers for the lumina-backend API.
 */

import { http, HttpResponse } from 'msw';

import { mockTokenBalance } from '../fixtures/soroban';
import { mockVaults, mockSubSchedules, mockClaimResponse, mockVault } from '../fixtures/vesting';

const API_BASE = 'http://localhost:4000/api';

export const handlers = [
  http.get(`${API_BASE}/vaults`, () => HttpResponse.json({ data: mockVaults, total: mockVaults.length, page: 1, pageSize: 20 })),
  http.get(`${API_BASE}/vaults/:id`, ({ params }) => {
    const vault = mockVaults.find((v) => v.id === params.id) ?? mockVault;
    return HttpResponse.json({ data: vault });
  }),
  http.get(`${API_BASE}/vaults/:vaultId/sub-schedules`, () => HttpResponse.json({ data: mockSubSchedules })),
  http.post(`${API_BASE}/vaults/:vaultId/claim`, () => HttpResponse.json(mockClaimResponse, { status: 201 })),
  http.get(`${API_BASE}/portfolio/summary`, () => HttpResponse.json({ data: { totalValueUsd: '125000', totalClaimed: '4500000000000', totalPending: '7500000000000', vaults: 3, activeStreams: 2 } })),
  http.get(`${API_BASE}/portfolio/balances`, () => HttpResponse.json({ data: [mockTokenBalance] })),
  http.get(`${API_BASE}/auth/challenge`, () => HttpResponse.json({ transaction: 'AAAAAgAAA...', networkPassphrase: 'Test SDF Network ; September 2015' })),
  http.post(`${API_BASE}/auth/token`, () => HttpResponse.json({ token: 'eyJhbGciOi...mockToken', expiresAt: Date.now() + 3600_000 })),
  http.post(`${API_BASE}/auth/refresh`, () => HttpResponse.json({ token: 'eyJhbGciOi...refreshed', expiresAt: Date.now() + 3600_000 })),
  http.get(`${API_BASE}/admin/users`, () => HttpResponse.json({ data: [{ id: 'user_01', publicKey: 'GBJ5SZLKO3VYXKJ5F5KOGZDCRWWMMSEECAHGJHWOBGF7BPBTMJ4YJ7OC', kycStatus: 'verified', role: 'contributor', createdAt: '2025-01-15T00:00:00Z' }], total: 1 })),
];
