'use client';

import { useState, useEffect, useCallback } from 'react';

export interface CryptoPrices {
  BTC: number;
  SOL: number;
  USDC: number;
  USDT: number;
}

const DEFAULT_PRICES: CryptoPrices = {
  BTC: 97000,
  SOL: 230,
  USDC: 1,
  USDT: 1,
};

export function useCryptoPrices(refreshInterval = 10000) {
  const [prices, setPrices] = useState<CryptoPrices>(DEFAULT_PRICES);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchPrices = useCallback(async () => {
    try {
      // Use our API route to avoid CORS issues
      const response = await fetch('/api/prices', { cache: 'no-store' });

      if (!response.ok) {
        throw new Error('Failed to fetch prices');
      }

      const newPrices: CryptoPrices = await response.json();

      setPrices(newPrices);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      console.error('Error fetching crypto prices:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      // Keep using previous prices on error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Fetch immediately
    fetchPrices();

    // Then fetch every refreshInterval ms
    const interval = setInterval(fetchPrices, refreshInterval);

    return () => clearInterval(interval);
  }, [fetchPrices, refreshInterval]);

  return { prices, loading, error, lastUpdated, refetch: fetchPrices };
}

// Singleton price store for components that can't use hooks
let globalPrices: CryptoPrices = DEFAULT_PRICES;
let globalListeners: Set<(prices: CryptoPrices) => void> = new Set();

export function getGlobalPrices(): CryptoPrices {
  return globalPrices;
}

export function subscribeToGlobalPrices(listener: (prices: CryptoPrices) => void) {
  globalListeners.add(listener);
  return () => globalListeners.delete(listener);
}

export function updateGlobalPrices(prices: CryptoPrices) {
  globalPrices = prices;
  globalListeners.forEach(listener => listener(prices));
}

