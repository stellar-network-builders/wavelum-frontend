/**
 * Unit tests for lib/security.ts.
 */

import { describe, expect, it } from 'vitest';
import { sanitizeAddress, validateRedirectUrl, stripSensitiveFromLogs, getNonce } from '@/lib/security';

describe('sanitizeAddress', () => {
  it('returns empty for falsy input', () => { expect(sanitizeAddress('')).toBe(''); });
  it('returns short addresses unchanged', () => { expect(sanitizeAddress('GABC')).toBe('GABC'); });
  it('truncates Stellar public key', () => {
    expect(sanitizeAddress('GBJ5SZLKO3VYXKJ5F5KOGZDCRWWMMSEECAHGJHWOBGF7BPBTMJ4YJ7OC')).toBe('GBJ5...7OC');
  });
});

describe('validateRedirectUrl', () => {
  it('returns false for empty', () => { expect(validateRedirectUrl('')).toBe(false); });
  it('returns true for same-origin', () => {
    expect(validateRedirectUrl(`${window.location.origin}/dashboard`)).toBe(true);
  });
  it('returns false for external', () => {
    expect(validateRedirectUrl('https://evil.com/phishing')).toBe(false);
  });
});

describe('stripSensitiveFromLogs', () => {
  it('redacts token', () => {
    const result = stripSensitiveFromLogs({ token: 'secret', name: 'Alice' });
    expect(result.token).toBe('[REDACTED]');
    expect(result.name).toBe('Alice');
  });
  it('redacts nested password', () => {
    const result = stripSensitiveFromLogs({ user: { password: 'hunter2', age: 30 }, public: 'safe' });
    expect((result.user as Record<string, unknown>).password).toBe('[REDACTED]');
    expect(result.public).toBe('safe');
  });
  it('leaves non-sensitive intact', () => {
    expect(stripSensitiveFromLogs({ name: 'Bob', role: 'admin' })).toEqual({ name: 'Bob', role: 'admin' });
  });
});

describe('getNonce', () => {
  it('returns 16-char alphanumeric', () => {
    const nonce = getNonce();
    expect(nonce).toHaveLength(16);
    expect(nonce).toMatch(/^[A-Za-z0-9]+$/);
  });
  it('generates different values', () => { expect(getNonce()).not.toBe(getNonce()); });
});
