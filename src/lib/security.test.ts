import { describe, it, expect } from 'vitest';
import {
  sanitizeAddress,
  validateRedirectUrl,
  stripSensitiveFromLogs,
  getNonce,
} from './security';

describe('sanitizeAddress', () => {
  it('truncates a full Stellar public key', () => {
    const result = sanitizeAddress('GA1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ123456');
    expect(result).toBe('GA12...456');
  });

  it('returns empty string for empty input', () => {
    expect(sanitizeAddress('')).toBe('');
  });

  it('returns short address unchanged', () => {
    expect(sanitizeAddress('GA123')).toBe('GA123');
  });

  it('handles nullish gracefully', () => {
    // Testing with empty string as the function handles it
    expect(sanitizeAddress('')).toBe('');
  });

  it('handles exactly 10 character address', () => {
    // length >= 10 triggers truncation: first 4 + ... + last 3
    expect(sanitizeAddress('ABCDEFGHIJ')).toBe('ABCD...HIJ');
  });
});

describe('validateRedirectUrl', () => {
  it('returns true for same-origin URLs', () => {
    const origin = window.location.origin;
    expect(validateRedirectUrl(`${origin}/dashboard`)).toBe(true);
    expect(validateRedirectUrl(`${origin}/vesting/123`)).toBe(true);
  });

  it('returns false for external URLs', () => {
    expect(validateRedirectUrl('https://evil.com/phishing')).toBe(false);
    expect(validateRedirectUrl('//evil.com')).toBe(false);
  });

  it('returns false for empty/falsy input', () => {
    expect(validateRedirectUrl('')).toBe(false);
  });

  it('handles invalid URLs', () => {
    expect(validateRedirectUrl('not a url')).toBe(false);
  });

  it('handles relative paths', () => {
    expect(validateRedirectUrl('/dashboard')).toBe(true);
    expect(validateRedirectUrl('./relative')).toBe(true);
  });
});

describe('stripSensitiveFromLogs', () => {
  it('redacts token fields', () => {
    const input = { token: 'abc123', name: 'John' };
    const result = stripSensitiveFromLogs(input);
    expect(result.token).toBe('[REDACTED]');
    expect(result.name).toBe('John');
  });

  it('redacts secret fields', () => {
    const input = { secret: 'xyz789', data: 'visible' };
    const result = stripSensitiveFromLogs(input);
    expect(result.secret).toBe('[REDACTED]');
    expect(result.data).toBe('visible');
  });

  it('redacts password fields', () => {
    const input = { password: 'p@ssw0rd', username: 'alice' };
    const result = stripSensitiveFromLogs(input);
    expect(result.password).toBe('[REDACTED]');
  });

  it('redacts key fields', () => {
    const input = { apiKey: 'key-123', settings: true };
    const result = stripSensitiveFromLogs(input);
    expect(result.apiKey).toBe('[REDACTED]');
  });

  it('redacts authorization fields', () => {
    const input = { Authorization: 'Bearer xyz', scope: 'read' };
    const result = stripSensitiveFromLogs(input);
    expect(result.Authorization).toBe('[REDACTED]');
  });

  it('redacts jwt fields', () => {
    const input = { jwt: 'eyJ...', payload: 'data' };
    const result = stripSensitiveFromLogs(input);
    expect(result.jwt).toBe('[REDACTED]');
  });

  it('redacts private fields', () => {
    const input = { private_key: 'priv', privateKey: 'priv2' };
    const result = stripSensitiveFromLogs(input);
    expect(result.private_key).toBe('[REDACTED]');
    expect(result.privateKey).toBe('[REDACTED]');
  });

  it('recursively redacts nested objects', () => {
    const input = {
      user: { name: 'Alice', secret: 'hidden' },
      meta: { accessToken: 'tok' },
    };
    const result = stripSensitiveFromLogs(input);
    expect((result.user as Record<string, unknown>).secret).toBe('[REDACTED]');
    expect((result.user as Record<string, unknown>).name).toBe('Alice');
    expect((result.meta as Record<string, unknown>).accessToken).toBe('[REDACTED]');
  });

  it('returns empty object for empty input', () => {
    const result = stripSensitiveFromLogs({});
    expect(result).toEqual({});
  });

  it('handles null values in nested objects', () => {
    const input = { data: null, settings: { token: '123' } };
    const result = stripSensitiveFromLogs(input);
    expect(result.data).toBeNull();
    expect((result.settings as Record<string, unknown>).token).toBe('[REDACTED]');
  });
});

describe('getNonce', () => {
  it('returns a 16-character alphanumeric string', () => {
    const nonce = getNonce();
    expect(nonce).toHaveLength(16);
    expect(nonce).toMatch(/^[A-Za-z0-9]{16}$/);
  });

  it('generates different nonces on subsequent calls', () => {
    const nonces = new Set(Array.from({ length: 20 }, () => getNonce()));
    // All 20 nonces should be unique (statistically extremely likely)
    expect(nonces.size).toBe(20);
  });
});
