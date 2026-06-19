/**
 * Truncate a Stellar account address for safe display.
 * Shows the first 4 and last 3 characters with an ellipsis, e.g. "GA7...3JK".
 *
 * @param address - The full Stellar public key (G…).
 * @returns The masked address, or the original if it is shorter than 10 characters.
 */
export function sanitizeAddress(address: string): string {
  if (!address || address.length < 10) return address || '';
  return `${address.slice(0, 4)}...${address.slice(-3)}`;
}

/**
 * Validate that a redirect URL shares the same origin as the current window.
 * Used to prevent open redirect attacks.
 *
 * @param url - The URL to validate.
 * @returns `true` if the URL is same-origin, `false` otherwise.
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
 * Recursively redact sensitive keys (token, secret, password, etc.) from an object
 * before logging, replacing values with "[REDACTED]".
 *
 * @param obj - The object to sanitize.
 * @returns A deep copy with sensitive values replaced.
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
 * Generate a cryptographically random 16-character nonce for use in CSP headers.
 *
 * @returns A random alphanumeric string.
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
