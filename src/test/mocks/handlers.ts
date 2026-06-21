import { http, HttpResponse } from 'msw';

/**
 * MSW request handlers for all backend API endpoints.
 * These intercept outgoing fetch/axios requests during tests
 * and return controlled mock responses.
 */

const API_BASE = 'http://localhost:4000';

export const handlers = [
  // --- Health ---
  http.get(`${API_BASE}/health`, () => {
    return HttpResponse.json({ status: 'ok', timestamp: new Date().toISOString() });
  }),

  // --- Auth / Wallet ---
  http.get(`${API_BASE}/auth/nonce`, () => {
    return HttpResponse.json({ nonce: 'test-nonce-12345', expiresAt: Date.now() + 300000 });
  }),

  http.post(`${API_BASE}/auth/verify`, () => {
    return HttpResponse.json({
      token: 'mock-jwt-token-abcdef',
      user: {
        publicKey: 'GA1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ123456',
        createdAt: '2025-01-01T00:00:00Z',
      },
    });
  }),

  // --- Vesting ---
  http.get(`${API_BASE}/vesting`, () => {
    return HttpResponse.json({
      schedules: [],
      total: 0,
      page: 1,
      pageSize: 20,
    });
  }),

  http.get(`${API_BASE}/vesting/:id`, ({ params }) => {
    return HttpResponse.json({
      id: params.id,
      beneficiary: 'GA1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ123456',
      totalAmount: '100000.0000000',
      claimedAmount: '25000.0000000',
      status: 'active',
    });
  }),

  http.post(`${API_BASE}/vesting`, () => {
    return HttpResponse.json(
      {
        id: 'vest_new',
        status: 'active',
      },
      { status: 201 },
    );
  }),

  // --- Dashboard ---
  http.get(`${API_BASE}/dashboard/summary`, () => {
    return HttpResponse.json({
      totalVested: '180000.0000000',
      availableToClaim: '30000.0000000',
      nextVesting: new Date(Date.now() + 86400 * 1000).toISOString(),
      schedulesCount: 4,
      activeCount: 2,
    });
  }),

  // --- Error scenarios for testing error handling ---
  http.get(`${API_BASE}/error/401`, () => {
    return new HttpResponse(null, { status: 401 });
  }),

  http.get(`${API_BASE}/error/500`, () => {
    return new HttpResponse(null, { status: 500 });
  }),
];
