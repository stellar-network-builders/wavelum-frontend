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
 * Rejects cross-origin URLs and `javascript:` URIs.
 *
 * @param url - The URL to validate (may be relative or absolute).
 * @param allowedOrigin - Optional origin to compare against. Falls back to
 *   `window.location.origin` in the browser. In server contexts the caller
 *   must pass `allowedOrigin` explicitly for the validation to be meaningful.
 * @returns `true` when the URL's origin matches the allowed origin.
 */
export function validateRedirectUrl(
  url: string,
  allowedOrigin?: string,
): boolean {
  if (!url) return false;
  const origin =
    allowedOrigin ??
    (typeof window !== 'undefined' ? window.location.origin : '');
  if (!origin) return false;
  try {
    const parsed = new URL(url, origin);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return false;
    }
    return parsed.origin === origin;
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
export function stripSensitiveFromLogs(
  obj: Record<string, unknown>,
): Record<string, unknown> {
  const sensitiveKeys = [
    'token',
    'secret',
    'password',
    'key',
    'authorization',
    'jwt',
    'private',
  ];
  const redacted: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (sensitiveKeys.some((sk) => key.toLowerCase().includes(sk))) {
      redacted[key] = '[REDACTED]';
    } else if (value !== null && typeof value === 'object') {
      redacted[key] = stripSensitiveFromLogs(
        value as Record<string, unknown>,
      );
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

/**
 * Sanitize a string of untrusted HTML before assigning it to
 * `dangerouslySetInnerHTML` (or any other consumer).
 *
 * Removes:
 *   - Full `<script>` and `<style>` elements (open tag, body, and close tag)
 *   - `<iframe>` and `<object>` elements (entirely)
 *   - Inline event handler attributes (e.g. `onclick`, `onerror`)
 *   - `javascript:`, `vbscript:`, and `data:` URIs on common URL-bearing
 *     attributes (`href`, `src`, `action`, `formaction`, `xlink:href`)
 *
 * For maximum safety, prefer DOMPurify; this helper is a light-weight
 * mitigation that the dApp can rely on without an extra dependency.
 *
 * @param html - The untrusted HTML string.
 * @returns A sanitized HTML string with dangerous constructs removed.
 */
export function sanitizeHtml(html: unknown): string {
  if (typeof html !== 'string') return '';
  let out = html;
  // Remove entire <script>…</script> and <style>…</style> blocks incl. body
  // (without the `s` flag the body would leak into the rendered output).
  out = out.replace(
    /<(?:script|style)\b[^>]*>[\s\S]*?<\/(?:script|style)>/gi,
    '',
  );
  // Remove embedded <iframe> and <object> elements entirely.
  out = out.replace(
    /<(?:iframe|object|embed)\b[^>]*>[\s\S]*?<\/(?:iframe|object|embed)>/gi,
    '',
  );
  // Strip on*= attributes (covers onclick="...", onerror='...', onload=foo).
  out = out.replace(
    /\s+on[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi,
    '',
  );
  // Defuse dangerous protocols on common URL-bearing attributes. The `\s*`
  // inside the protocol body catches "javascript\t:" and similar whitespace
  // tricks that browsers historically normalized away.
  out = out.replace(
    /\s(href|src|action|formaction|xlink:href)\s*=\s*(?:"\s*(?:javascript|vbscript|data)\s*:[^"]*"|'\s*(?:javascript|vbscript|data)\s*:[^']*'|\s*(?:javascript|vbscript|data)\s*:[^\s>]+)/gi,
    (_, attr: string) => ` ${attr}="#"`,
  );
  return out;
}

/**
 * Conditionally log an object while redacting sensitive keys in production.
 * In development, logs the original object for debugging.
 *
 * Safe to call on the server: a no-op when `window` is undefined so secrets
 * are never written to server logs. Calling with `null` / `undefined` is also
 * a no-op so callers don't have to defensively check before logging.
 *
 * @param label - Description or category for the log line.
 * @param value - Object or array to log (will be redacted in production).
 *                If `null` or `undefined`, no log line is emitted.
 */
export function safeLog(
  label: string,
  value?: Record<string, unknown> | unknown[] | null,
): void {
  if (typeof window === 'undefined') return;
  if (value === null || value === undefined) return;
  if (process.env.NODE_ENV === 'production') {
    const redacted = Array.isArray(value)
      ? value.map((item) =>
          item && typeof item === 'object'
            ? stripSensitiveFromLogs(item as Record<string, unknown>)
            : item,
        )
      : stripSensitiveFromLogs(value);
    console.log(label, redacted);
  } else {
    console.log(label, value);
  }
}
