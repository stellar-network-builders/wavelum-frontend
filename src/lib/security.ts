const SENSITIVE_PATTERNS = [
  /[GABC][0-9A-Z]{55}/g,
  /S[0-9A-Za-z]{55}/g,
  /[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+/g,
  /gh[ps]_[A-Za-z0-9]{36,}/g,
  /sk_[0-9a-fA-F]{32,}/g,
  /pk_[0-9a-fA-F]{32,}/g,
];

export function sanitizeAddress(address: string): string {
  if (!address || address.length < 8) return address;
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

export function validateRedirectUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    const allowedHosts = [
      'localhost',
      'stellar.org',
      'soroban-testnet.stellar.org',
      'soroban-mainnet.stellar.org',
      'horizon-testnet.stellar.org',
      'horizon.stellar.org',
    ];

    if (parsed.protocol !== 'https:' && parsed.hostname !== 'localhost') {
      return null;
    }

    const isAllowed = allowedHosts.some(
      (host) => parsed.hostname === host || parsed.hostname.endsWith(`.${host}`),
    );

    if (!isAllowed && parsed.hostname !== 'localhost') {
      return null;
    }

    return url;
  } catch {
    return null;
  }
}

export function stripSensitiveFromLogs(obj: Record<string, unknown>): Record<string, unknown> {
  if (process.env.NODE_ENV === 'production') {
    return {};
  }

  const sensitiveKeys = [
    'token', 'jwt', 'secret', 'password', 'key', 'authorization',
    'privateKey', 'seed', 'phrase', 'mnemonic',
  ];

  const redacted = { ...obj };
  for (const key of Object.keys(redacted)) {
    if (sensitiveKeys.some((sk) => key.toLowerCase().includes(sk.toLowerCase()))) {
      redacted[key] = '[REDACTED]';
    }
  }
  return redacted;
}

export function sanitizeForDisplay(input: string): string {
  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML;
}

export { SENSITIVE_PATTERNS };
