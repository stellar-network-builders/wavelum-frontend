/**
 * Unit tests for `src/lib/security.ts`.
 *
 * Covers address truncation, open-redirect prevention, log redaction,
 * nonce generation, HTML sanitization, and production-safe logging.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  getNonce,
  safeLog,
  sanitizeAddress,
  sanitizeHtml,
  stripSensitiveFromLogs,
  validateRedirectUrl,
} from '@/lib/security';

const ORIGIN = 'https://app.example.com';

describe('sanitizeAddress', () => {
  it('truncates long Stellar public keys', () => {
    expect(
      sanitizeAddress('GA7YK5N33YBN3HX3X5QYZZJZ5XJZJ5XJZJ5XJZJ5'),
    ).toBe('GA7Y...ZJ5');
  });

  it('keeps short strings unchanged (>= 10 chars)', () => {
    expect(sanitizeAddress('abcdefghijklmno')).toBe('abcd...mno');
  });

  it('returns empty string for empty input', () => {
    expect(sanitizeAddress('')).toBe('');
  });

  it('keeps strings under 10 characters unchanged', () => {
    expect(sanitizeAddress('short')).toBe('short');
  });
});

describe('validateRedirectUrl', () => {
  it('accepts same-origin absolute URLs', () => {
    expect(validateRedirectUrl(`${ORIGIN}/dashboard`, ORIGIN)).toBe(true);
  });

  it('rejects cross-origin absolute URLs', () => {
    expect(validateRedirectUrl('https://evil.example.com/x', ORIGIN)).toBe(
      false,
    );
  });

  it('rejects http-when-origin-is-https (mixed content)', () => {
    expect(validateRedirectUrl('http://app.example.com/x', ORIGIN)).toBe(
      false,
    );
  });

  it('rejects javascript: URIs', () => {
    expect(validateRedirectUrl('javascript:alert(1)', ORIGIN)).toBe(false);
  });

  it('rejects protocol-relative URLs to other hosts', () => {
    expect(validateRedirectUrl('//evil.example.com/x', ORIGIN)).toBe(false);
  });

  it('accepts relative URLs (same-origin)', () => {
    expect(validateRedirectUrl('/dashboard', ORIGIN)).toBe(true);
  });

  it('accepts relative URLs with query / fragment', () => {
    expect(validateRedirectUrl('/dashboard?tab=vaults', ORIGIN)).toBe(true);
    expect(validateRedirectUrl('/dashboard#claims', ORIGIN)).toBe(true);
  });

  it('returns false for empty input', () => {
    expect(validateRedirectUrl('', ORIGIN)).toBe(false);
  });

  it('returns false when allowedOrigin missing and window undefined', () => {
    const originalWindow = globalThis.window;
    delete (globalThis as unknown as { window?: unknown }).window;
    expect(validateRedirectUrl('/dashboard')).toBe(false);
    if (originalWindow !== undefined) {
      globalThis.window = originalWindow;
    }
  });
});

describe('stripSensitiveFromLogs', () => {
  it('redacts top-level sensitive keys', () => {
    expect(
      stripSensitiveFromLogs({ token: 'abc', user: 'alice' }),
    ).toEqual({ token: '[REDACTED]', user: 'alice' });
  });

  it('redacts sensitive substrings within keys', () => {
    expect(
      stripSensitiveFromLogs({ authToken: 'x', apiSecret: 'y' }),
    ).toEqual({ authToken: '[REDACTED]', apiSecret: '[REDACTED]' });
  });

  it('redacts nested sensitive keys', () => {
    expect(
      stripSensitiveFromLogs({
        api: { authToken: 'sec', other: 1 },
        top: 'ok',
      }),
    ).toEqual({
      api: { authToken: '[REDACTED]', other: 1 },
      top: 'ok',
    });
  });

  it('handles empty objects', () => {
    expect(stripSensitiveFromLogs({})).toEqual({});
  });

  it('leaves primitive values untouched', () => {
    expect(stripSensitiveFromLogs({ user: 'alice', age: 30 })).toEqual({
      user: 'alice',
      age: 30,
    });
  });
});

describe('getNonce', () => {
  it('returns a 16-character alphanumeric string', () => {
    const n = getNonce();
    expect(n).toHaveLength(16);
    expect(n).toMatch(/^[A-Za-z0-9]+$/);
  });

  it('returns different nonces across calls', () => {
    const n1 = getNonce();
    const n2 = getNonce();
    expect(n1).not.toBe(n2);
  });
});

describe('sanitizeHtml', () => {
  it('removes <script> elements including their body', () => {
    expect(sanitizeHtml('<script>alert(1)</script>hi')).toBe('hi');
    expect(sanitizeHtml('<script type="text/javascript">x()</script>')).toBe('');
  });

  it('removes <style> elements including their body', () => {
    expect(sanitizeHtml('<style>.x{}</style>hi')).toBe('hi');
    expect(sanitizeHtml('<style>.x{}</style>')).toBe('');
  });

  it('removes full <iframe>, <object>, <embed> elements', () => {
    expect(sanitizeHtml('<iframe src="evil.com"></iframe>')).toBe('');
    expect(
      sanitizeHtml('<object data="x"><param name="a" value="b"></object>'),
    ).toBe('');
  });

  it('removes on* event handler attributes', () => {
    expect(sanitizeHtml('<button onclick="x()">ok</button>')).toBe(
      '<button>ok</button>',
    );
    expect(sanitizeHtml("<img onerror='boom()' src='x'>")).toBe(
      "<img src='x'>",
    );
  });

  it('disarms javascript: / vbscript: / data: hrefs', () => {
    const jsLink = sanitizeHtml('<a href="javascript:alert(1)">x</a>');
    expect(jsLink).toContain('href="#"');
    expect(jsLink).not.toContain('javascript:');

    const vbLink = sanitizeHtml("<a href='vbscript:msgbox(1)'>x</a>");
    expect(vbLink).toContain('href="#"');

    const dataLink = sanitizeHtml('<a href="data:text/html,<script>">x</a>');
    expect(dataLink).toContain('href="#"');

    const bareProto = sanitizeHtml('<a href=javascript:alert(1)>x</a>');
    expect(bareProto).toContain('href="#"');
  });

  it('preserves safe relative and http hrefs', () => {
    expect(sanitizeHtml('<a href="/dashboard">ok</a>')).toBe(
      '<a href="/dashboard">ok</a>',
    );
    expect(sanitizeHtml('<a href="https://example.com">ok</a>')).toBe(
      '<a href="https://example.com">ok</a>',
    );
  });

  it('returns empty string for non-string input', () => {
    expect(sanitizeHtml(null)).toBe('');
    expect(sanitizeHtml(undefined)).toBe('');
    expect(sanitizeHtml(42)).toBe('');
  });

  it('leaves benign html untouched', () => {
    expect(sanitizeHtml('<p>hello <strong>world</strong></p>')).toBe(
      '<p>hello <strong>world</strong></p>',
    );
  });
});

describe('safeLog', () => {
  const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

  beforeEach(() => {
    logSpy.mockClear();
    globalThis.window = globalThis.window ?? ({} as Window);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('is a no-op when window is undefined', () => {
    const originalWindow = globalThis.window;
    delete (globalThis as unknown as { window?: Window }).window;
    safeLog('hi', { token: 'x' });
    expect(logSpy).not.toHaveBeenCalled();
    globalThis.window = originalWindow;
  });

  it('is a no-op when value is null or undefined', () => {
    safeLog('hi', null);
    safeLog('hi', undefined);
    expect(logSpy).not.toHaveBeenCalled();
  });

  it('redacts keys in production', () => {
    vi.stubEnv('NODE_ENV', 'production');
    safeLog('test', { token: 'abc', user: 'bob' });
    expect(logSpy).toHaveBeenCalledWith('test', {
      token: '[REDACTED]',
      user: 'bob',
    });
  });

  it('passes object through in development', () => {
    vi.stubEnv('NODE_ENV', 'development');
    safeLog('test', { token: 'abc', user: 'bob' });
    expect(logSpy).toHaveBeenCalledWith('test', { token: 'abc', user: 'bob' });
  });

  it('handles array inputs in production', () => {
    vi.stubEnv('NODE_ENV', 'production');
    safeLog('arr', [{ token: 'x', user: 'bob' }, { password: 'p' }]);
    expect(logSpy).toHaveBeenCalledWith('arr', [
      { token: '[REDACTED]', user: 'bob' },
      { password: '[REDACTED]' },
    ]);
  });
});
