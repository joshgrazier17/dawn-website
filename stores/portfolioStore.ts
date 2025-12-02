import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface TokenBalance {
  symbol: string;
  name: string;
  amount: number;
  priceUsd: number; // Current price (will be updated live)
  purchasePrice: number; // Price at which the token was bought (for performance calculation)
  icon: string;
}

interface PortfolioStore {
  // Starting balance
  initialUsdcAmount: number;
  
  // Current balances
  balances: Record<string, TokenBalance>;
  
  // Actions
  swap: (fromSymbol: string, toSymbol: string, fromAmount: number, currentPrice?: number) => void;
  send: (symbol: string, amount: number) => void;
  receive: (symbol: string, amount: number, price?: number) => void;
  updatePrices: (prices: Record<string, number>) => void;
  resetPortfolio: () => void;
  
  // Computed
  getTotalValueUsd: () => number;
  getUsdcBalance: () => number;
}

const INITIAL_USDC_AMOUNT = 100000;

const initialBalances: Record<string, TokenBalance> = {
  USDC: {
    symbol: 'USDC',
    name: 'USD Coin',
    amount: INITIAL_USDC_AMOUNT,
    priceUsd: 1,
    purchasePrice: 1,
    icon: '/usdc.svg',
  },
  BTC: {
    symbol: 'BTC',
    name: 'Bitcoin',
    amount: 0,
    priceUsd: 97000,
    purchasePrice: 0,
    icon: '/icons/assets/Logos/Tokens.svg',
  },
  ETH: {
    symbol: 'ETH',
    name: 'Ethereum',
    amount: 0,
    priceUsd: 3650,
    purchasePrice: 0,
    icon: 'Ξ',
  },
  SOL: {
    symbol: 'SOL',
    name: 'Solana',
    amount: 0,
    priceUsd: 230,
    purchasePrice: 0,
    icon: '/icons/assets/Logos/Tokens-1.svg',
  },
};

export const usePortfolioStore = create<PortfolioStore>()(
  persist(
    (set, get) => ({
      initialUsdcAmount: INITIAL_USDC_AMOUNT,
      balances: initialBalances,

      swap: (fromSymbol, toSymbol, fromAmount, currentPrice) => {
        set((state) => {
          const fromToken = state.balances[fromSymbol];
          const toToken = state.balances[toSymbol];
          
          if (!fromToken || !toToken || fromToken.amount < fromAmount) {
            return state;
          }

          // Use provided current price or fall back to stored price
          const buyPrice = currentPrice ?? toToken.priceUsd;
          
          // Calculate swap (simple conversion based on USD values)
          const usdValue = fromAmount * fromToken.priceUsd;
          const toAmount = usdValue / buyPrice;

          // Calculate new average purchase price (weighted average)
          const existingValue = toToken.amount * toToken.purchasePrice;
          const newValue = toAmount * buyPrice;
          const totalAmount = toToken.amount + toAmount;
          const newPurchasePrice = totalAmount > 0 
            ? (existingValue + newValue) / totalAmount 
            : buyPrice;

          return {
            balances: {
              ...state.balances,
              [fromSymbol]: {
                ...fromToken,
                amount: fromToken.amount - fromAmount,
              },
              [toSymbol]: {
                ...toToken,
                amount: toToken.amount + toAmount,
                priceUsd: buyPrice,
                purchasePrice: newPurchasePrice,
              },
            },
          };
        });
      },

      send: (symbol, amount) => {
        set((state) => {
          const token = state.balances[symbol];
          if (!token || token.amount < amount) {
            return state;
          }

          return {
            balances: {
              ...state.balances,
              [symbol]: {
                ...token,
                amount: token.amount - amount,
              },
            },
          };
        });
      },

      receive: (symbol, amount, price) => {
        set((state) => {
          const token = state.balances[symbol];
          if (!token) return state;

          const receivePrice = price ?? token.priceUsd;
          
          // Calculate new average purchase price
          const existingValue = token.amount * token.purchasePrice;
          const newValue = amount * receivePrice;
          const totalAmount = token.amount + amount;
          const newPurchasePrice = totalAmount > 0 
            ? (existingValue + newValue) / totalAmount 
            : receivePrice;

          return {
            balances: {
              ...state.balances,
              [symbol]: {
                ...token,
                amount: token.amount + amount,
                purchasePrice: newPurchasePrice,
              },
            },
          };
        });
      },

      updatePrices: (prices) => {
        set((state) => {
          const updatedBalances = { ...state.balances };
          
          for (const [symbol, price] of Object.entries(prices)) {
            if (updatedBalances[symbol]) {
              updatedBalances[symbol] = {
                ...updatedBalances[symbol],
                priceUsd: price,
              };
            }
          }

          return { balances: updatedBalances };
        });
      },

      resetPortfolio: () => {
        set({ balances: initialBalances });
      },

      getTotalValueUsd: () => {
        const { balances } = get();
        return Object.values(balances).reduce(
          (total, token) => total + token.amount * token.priceUsd,
          0
        );
      },

      getUsdcBalance: () => {
        const { balances } = get();
        return balances.USDC?.amount ?? 0;
      },
    }),
    {
      name: 'dawn-portfolio',
    }
  )
);
