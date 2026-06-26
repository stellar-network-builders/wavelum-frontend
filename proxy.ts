/**
 * Next.js 16 Proxy (formerly Middleware).
 *
 * Adds a per-request nonce to `Content-Security-Policy` so any inline script
 * served by the app must carry the matching `nonce` attribute - even if a
 * malicious script were somehow injected, the browser would refuse to run it.
 *
 * - Generates a fresh 16-character cryptographically random nonce per request.
 * - Adds the nonce to `script-src` of the `Content-Security-Policy` header.
 * - Exposes the nonce to Server Components via the `x-nonce` request header
 *   so they can pass it to `<Script nonce={…}>` or any inline `<script>`.
 *
 * Static security headers (HSTS, X-Frame-Options, Referrer-Policy, …) remain
 * in `next.config.ts` so static assets - which this Proxy skips - also have
 * them. Each header has exactly one source of truth.
 *
 * Skipped: API routes, internal Next assets, and obvious static extensions so
 * per-request overhead does not enter the hot path.
 */
import { NextRequest, NextResponse } from 'next/server';

/**
 * Nonce generation - uses the Web Crypto API which is available in the proxy
 * runtime. Matches the algorithm of `getNonce()` in `src/lib/security.ts` so
 * values generated here can be cross-checked by tests.
 */
function generateNonce(): string {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let nonce = '';
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  for (let i = 0; i < 16; i++) {
    nonce += chars[array[i] % chars.length];
  }
  return nonce;
}

const BASE_DIRECTIVES = [
  `default-src 'self'`,
  `base-uri 'self'`,
  `frame-ancestors 'none'`,
  `form-action 'self'`,
  `img-src 'self' data: https://*.gravatar.com`,
  `style-src 'self' 'unsafe-inline'`,
  `connect-src 'self' https://*.stellar.org https://soroban-testnet.stellar.org https://*.sentry.io`,
];

export function proxy(request: NextRequest) {
  const nonce = generateNonce();
  // In development we relax script-src so the Next.js dev server's HMR (which
  // injects inline scripts and uses eval for fast refresh) keeps working.
  // Production builds keep the policy strict - no 'unsafe-inline' or
  // 'unsafe-eval' are emitted.
  const scriptSrc =
    process.env.NODE_ENV === 'development'
      ? `script-src 'self' 'unsafe-inline' 'unsafe-eval' 'nonce-${nonce}'`
      : `script-src 'self' 'nonce-${nonce}'`;
  const csp = [scriptSrc, ...BASE_DIRECTIVES].join('; ');

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });
  response.headers.set('Content-Security-Policy', csp);
  return response;
}

export const config = {
  /*
   * Skip the proxy on Next.js internals, API routes, and obvious static
   * assets so per-request overhead does not enter the hot path.
   */
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|css|js|map)$).*)',
  ],
};
