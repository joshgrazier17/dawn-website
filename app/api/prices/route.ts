import { NextResponse } from 'next/server';

const COINGECKO_IDS: Record<string, string> = {
  BTC: 'bitcoin',
  SOL: 'solana',
  USDC: 'usd-coin',
  USDT: 'tether',
};

export async function GET() {
  try {
    const ids = Object.values(COINGECKO_IDS).join(',');
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`,
      { 
        next: { revalidate: 5 }, // Cache for 5 seconds
        headers: {
          'Accept': 'application/json',
        }
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch prices from CoinGecko');
    }

    const data = await response.json();
    
    // Transform to our format
    const prices = {
      BTC: data[COINGECKO_IDS.BTC]?.usd ?? 97000,
      SOL: data[COINGECKO_IDS.SOL]?.usd ?? 230,
      USDC: data[COINGECKO_IDS.USDC]?.usd ?? 1,
      USDT: data[COINGECKO_IDS.USDT]?.usd ?? 1,
    };

    return NextResponse.json(prices);
  } catch (error) {
    console.error('Error fetching crypto prices:', error);
    
    // Return fallback prices on error
    return NextResponse.json({
      BTC: 97000,
      SOL: 230,
      USDC: 1,
      USDT: 1,
    });
  }
}

