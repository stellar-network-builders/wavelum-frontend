/**
 * Truncate a Stellar public key for safe display.
 * Shows the first 4 and last 3 characters with an ellipsis in between.
 * Short addresses (under 10 characters) are returned as-is.
 *
 * @param address - Full Stellar public key (G...).
 * @returns A human-readable truncated address, e.g. "GABC...XYZ".
 */
export function sanitizeAddress(address: string): string {
  if (!address || address.length < 10) return address || '';
  return `${address.slice(0, 4)}...${address.slice(-3)}`;
}

/**
 * Validate that a redirect URL is same-origin to prevent open-redirect attacks.
 *
 * @param url - The URL to validate.
 * @returns `true` when the URL's origin matches `window.location.origin`.
 */
export function validateRedirectUrl(url: string): boolean {
  if (!url) return false;
  try {
    const parsed = new URL(url, window.location.origin);
    return parsed.origin === window.location.origin;
  } catch {
    return false;
  }
}

/**
 * Recursively redact sensitive keys (token, secret, password, key, etc.)
 * from an object before it is logged. Matching values are replaced with
 * the string `"[REDACTED]"`.
 *
 * @param obj - The object to sanitize.
 * @returns A shallow-cloned copy with sensitive values redacted.
 */
export function stripSensitiveFromLogs(obj: Record<string, unknown>): Record<string, unknown> {
  const sensitiveKeys = ['token', 'secret', 'password', 'key', 'authorization', 'jwt', 'private'];
  const redacted: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (sensitiveKeys.some((sk) => key.toLowerCase().includes(sk))) {
      redacted[key] = '[REDACTED]';
    } else if (value !== null && typeof value === 'object') {
      redacted[key] = stripSensitiveFromLogs(value as Record<string, unknown>);
    } else {
      redacted[key] = value;
    }
  }
  return redacted;
}

/**
 * Generate a cryptographically random 16-character nonce for CSP headers.
 *
 * @returns A random alphanumeric string suitable for a `script-src` nonce.
 */
export function getNonce(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let nonce = '';
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  for (let i = 0; i < 16; i++) {
    nonce += chars[array[i] % chars.length];
  }
  return nonce;
}
