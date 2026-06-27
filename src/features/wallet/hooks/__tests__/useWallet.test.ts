/**
 * useWallet hook tests
 */

import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { useWallet } from '../useWallet';

// Mock window.freighter
const mockFreighter = {
  isAllowed: vi.fn(),
  isConnected: vi.fn(),
  getPublicKey: vi.fn(),
  signTransaction: vi.fn(),
  getNetwork: vi.fn(),
};

declare global {
  interface Window {
    freighter?: typeof mockFreighter;
  }
}

describe('useWallet', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.freighter = mockFreighter;
  });

  it('should detect wallet availability on mount', () => {
    const { result } = renderHook(() => useWallet());

    expect(result.current.isAvailable).toBe(true);
  });

  it('should detect wallet not available when window.freighter is missing', () => {
    delete window.freighter;
    const { result } = renderHook(() => useWallet());

    expect(result.current.isAvailable).toBe(false);
  });

  it('should connect wallet successfully', async () => {
    mockFreighter.isAllowed.mockResolvedValue(true);
    mockFreighter.getPublicKey.mockResolvedValue('GABC123XYZ');
    mockFreighter.getNetwork.mockResolvedValue('testnet');

    const { result } = renderHook(() => useWallet());

    await result.current.connect();

    expect(result.current.isConnected).toBe(true);
    expect(result.current.publicKey).toBe('GABC123XYZ');
    expect(result.current.network).toBe('testnet');
  });

  it('should handle connection rejection', async () => {
    mockFreighter.isAllowed.mockRejectedValue(new Error('User rejected'));

    const { result } = renderHook(() => useWallet());

    await expect(result.current.connect()).rejects.toThrow();
    expect(result.current.error?.type).toBe('connection_rejected');
  });

  it('should disconnect wallet', () => {
    const { result } = renderHook(() => useWallet());

    // First connect
    result.current.connect();
    
    // Then disconnect
    result.current.disconnect();

    expect(result.current.isConnected).toBe(false);
    expect(result.current.publicKey).toBe(null);
  });

  it('should sign transaction when connected', async () => {
    mockFreighter.isAllowed.mockResolvedValue(true);
    mockFreighter.getPublicKey.mockResolvedValue('GABC123XYZ');
    mockFreighter.getNetwork.mockResolvedValue('testnet');
    mockFreighter.signTransaction.mockResolvedValue('signed_xdr');

    const { result } = renderHook(() => useWallet());

    await result.current.connect();
    const signedXdr = await result.current.signTransaction('unsigned_xdr');

    expect(signedXdr).toBe('signed_xdr');
    expect(mockFreighter.signTransaction).toHaveBeenCalledWith(
      'unsigned_xdr',
      { networkPassphrase: 'Test SDF Network ; September 2015' }
    );
  });

  it('should fail to sign transaction when not connected', async () => {
    const { result } = renderHook(() => useWallet());

    await expect(result.current.signTransaction('xdr')).rejects.toThrow();
    expect(result.current.error?.type).toBe('signing_failed');
  });

  it('should switch network successfully', async () => {
    mockFreighter.getNetwork.mockResolvedValue('mainnet');

    const { result } = renderHook(() => useWallet());

    await result.current.switchNetwork('mainnet');

    expect(result.current.network).toBe('mainnet');
  });

  it('should handle wrong network error', async () => {
    mockFreighter.getNetwork.mockResolvedValue('testnet');

    const { result } = renderHook(() => useWallet());
    
    // Simulate connected state
    result.current.connect();
    
    await expect(result.current.switchNetwork('mainnet')).rejects.toThrow();
    expect(result.current.error?.type).toBe('wrong_network');
  });

  it('should perform SEP-10 authentication', async () => {
    mockFreighter.getPublicKey.mockResolvedValue('GABC123XYZ');
    mockFreighter.signTransaction.mockResolvedValue('signed_challenge');

    global.fetch = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          transaction: 'challenge_xdr',
          networkPassphrase: 'Test SDF Network ; September 2015',
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ token: 'jwt_token' }),
      });

    const { result } = renderHook(() => useWallet());

    await result.current.connect();
    const token = await result.current.performSEP10Auth('https://api.example.com');

    expect(token).toBe('jwt_token');
  });

  it('should handle SEP-10 authentication failure', async () => {
    mockFreighter.getPublicKey.mockResolvedValue('GABC123XYZ');

    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
    });

    const { result } = renderHook(() => useWallet());

    await result.current.connect();
    
    await expect(
      result.current.performSEP10Auth('https://api.example.com')
    ).rejects.toThrow();
    expect(result.current.error?.type).toBe('auth_failed');
  });
});
