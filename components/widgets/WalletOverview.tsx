'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { usePortfolioStore } from '@/stores/portfolioStore';
import { useCryptoPrices } from '@/hooks/useCryptoPrices';
import BuyModal from '@/components/modals/BuyModal';

// Slot animation component for numbers
function SlotNumber({ value, prefix = '', suffix = '', className = '' }: { value: string; prefix?: string; suffix?: string; className?: string }) {
  const prevValue = useRef(value);
  const [displayValue, setDisplayValue] = useState(value);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (prevValue.current !== value) {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        setDisplayValue(value);
        setIsAnimating(false);
        prevValue.current = value;
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [value]);

  return (
    <span className={`relative inline-flex overflow-hidden ${className}`}>
      <motion.span
        key={displayValue}
        initial={isAnimating ? { y: -20, opacity: 0 } : false}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      >
        {prefix}{displayValue}{suffix}
      </motion.span>
    </span>
  );
}

// Asset icon mapping
const assetIcons: Record<string, string> = {
  BTC: '/icons/assets/Logos/Tokens.svg',
  SOL: '/icons/assets/Logos/Tokens-1.svg',
  USDC: '/icons/assets/Logos/Tokens-2.svg',
  USDT: '/icons/assets/Logos/Tokens-3.svg',
};

export default function WalletOverview() {
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
  const balances = usePortfolioStore((state) => state.balances);
  const updatePrices = usePortfolioStore((state) => state.updatePrices);
  
  // Get live prices (updates every 10 seconds)
  const { prices, loading: pricesLoading } = useCryptoPrices(10000);
  
  // Update store prices when live prices change
  useEffect(() => {
    if (!pricesLoading) {
      updatePrices(prices);
    }
  }, [prices, pricesLoading, updatePrices]);
  
  // Portfolio value = total of non-USDC assets (crypto holdings) using live prices
  const portfolioValue = Object.entries(balances)
    .filter(([symbol]) => symbol !== 'USDC')
    .reduce((total, [symbol, token]) => {
      const livePrice = prices[symbol as keyof typeof prices] ?? token.priceUsd;
      return total + token.amount * livePrice;
    }, 0);

  // Get non-USDC assets that have a balance with live performance
  const ownedAssets = Object.entries(balances)
    .filter(([symbol, token]) => symbol !== 'USDC' && token.amount > 0)
    .map(([symbol, token]) => {
      const livePrice = prices[symbol as keyof typeof prices] ?? token.priceUsd;
      // Calculate performance: (current price - purchase price) / purchase price * 100
      const performance = token.purchasePrice > 0 
        ? ((livePrice - token.purchasePrice) / token.purchasePrice) * 100
        : 0;
      
      return {
        ...token,
        currentPrice: livePrice,
        icon: assetIcons[symbol] || '',
        performance,
        currentValue: token.amount * livePrice,
      };
    });

  const hasAssets = ownedAssets.length > 0;

  // Calculate overall portfolio performance (weighted average based on current values)
  const overallPerformance = hasAssets && portfolioValue > 0
    ? ownedAssets.reduce((acc, asset) => {
        const weight = asset.currentValue / portfolioValue;
        return acc + asset.performance * weight;
      }, 0)
    : 0;

  const handleBuyClick = () => {
    setIsBuyModalOpen(true);
  };

  return (
    <>
    <div className="p-4 pb-6">
      {/* Balance section */}
      <div className="text-center pt-6 pb-6">
        <motion.div
          className="text-[42px] font-medium text-[#0d0d0d] tracking-[0.84px] leading-[1.2] mb-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <SlotNumber 
            value={portfolioValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            prefix="$"
          />
        </motion.div>
        
        {/* Performance badge - only show when user has assets */}
        <AnimatePresence>
          {hasAssets && (
            <motion.div
              className="inline-flex items-center gap-[2px] h-8 pl-1 pr-[10px] rounded-full border"
              style={{ 
                backgroundColor: overallPerformance >= 0 ? '#f2faf2' : '#faf2f2',
                borderColor: overallPerformance >= 0 ? '#51c467' : '#c45151',
              }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" fill={overallPerformance >= 0 ? '#2ac737' : '#c73737'} />
                <path 
                  d={overallPerformance >= 0 ? "M12 8v8M8 12l4-4 4 4" : "M12 16V8M8 12l4 4 4-4"} 
                  stroke="white" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                />
              </svg>
              <SlotNumber 
                value={Math.abs(overallPerformance).toFixed(2)}
                suffix="%"
                className={`text-[16px] font-normal tracking-[-0.32px] ${overallPerformance >= 0 ? 'text-[#2ac737]' : 'text-[#c73737]'}`}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Action buttons */}
      <motion.div 
        className="flex gap-1 mb-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        {/* Send button */}
        <motion.button 
          className="group relative flex-1 h-24 rounded-3xl flex flex-col items-center justify-center gap-[2px] overflow-hidden"
          style={{ backgroundColor: '#f7f7f7' }}
          initial={{ boxShadow: '0px 2px 16px 0px rgba(0, 0, 0, 0.05), inset 0px 2px 2px 0px #ffffff' }}
          whileHover={{ boxShadow: 'none' }}
          whileTap={{ boxShadow: 'none', scale: 0.98 }}
          transition={{ duration: 0.15 }}
        >
          <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-[0.03] transition-opacity duration-150 pointer-events-none" />
          <Image
            src="/icons/icon-send.svg"
            alt="Send"
            width={24}
            height={24}
            className="relative z-10"
          />
          <span className="relative z-10 text-[15px] text-[#0d0d0d] tracking-[-0.3px]">Send</span>
        </motion.button>

        {/* Receive button */}
        <motion.button 
          className="group relative flex-1 h-24 rounded-3xl flex flex-col items-center justify-center gap-[2px] overflow-hidden"
          style={{ backgroundColor: '#f7f7f7' }}
          initial={{ boxShadow: '0px 2px 16px 0px rgba(0, 0, 0, 0.05), inset 0px 2px 2px 0px #ffffff' }}
          whileHover={{ boxShadow: 'none' }}
          whileTap={{ boxShadow: 'none', scale: 0.98 }}
          transition={{ duration: 0.15 }}
        >
          <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-[0.03] transition-opacity duration-150 pointer-events-none" />
          <Image
            src="/icons/icon-receive.svg"
            alt="Receive"
            width={24}
            height={24}
            className="relative z-10"
          />
          <span className="relative z-10 text-[15px] text-[#0d0d0d] tracking-[-0.3px]">Receive</span>
        </motion.button>

        {/* Buy button */}
        <motion.button 
          className="group relative flex-1 h-24 rounded-3xl flex flex-col items-center justify-center gap-[2px] overflow-hidden"
          style={{ backgroundColor: '#f7f7f7' }}
          initial={{ boxShadow: '0px 2px 16px 0px rgba(0, 0, 0, 0.05), inset 0px 2px 2px 0px #ffffff' }}
          whileHover={{ boxShadow: 'none' }}
          whileTap={{ boxShadow: 'none', scale: 0.98 }}
          transition={{ duration: 0.15 }}
          onClick={handleBuyClick}
        >
          <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-[0.03] transition-opacity duration-150 pointer-events-none" />
          <Image
            src="/icons/icon-buy.svg"
            alt="Buy"
            width={24}
            height={24}
            className="relative z-10"
          />
          <span className="relative z-10 text-[15px] text-[#0d0d0d] tracking-[-0.3px]">Buy</span>
        </motion.button>
      </motion.div>

      {/* Asset rows - show when user has purchased crypto */}
      <AnimatePresence>
        {hasAssets && (
          <motion.div
            className="mb-4"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            {ownedAssets.map((asset, index) => (
              <motion.div
                key={asset.symbol}
                className="group relative h-16 flex items-center px-2 rounded-2xl cursor-pointer overflow-hidden"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                {/* Hover overlay - 2% black */}
                <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-[0.03] transition-opacity duration-150 pointer-events-none rounded-2xl" />
                
                {/* Token icon */}
                <div className="relative z-10 w-[42px] h-[42px] mr-[10px] flex-shrink-0">
                  <Image
                    src={asset.icon}
                    alt={asset.name}
                    width={42}
                    height={42}
                  />
                </div>
                
                {/* Left side: Name and amount */}
                <div className="relative z-10 flex flex-col gap-[2px] flex-1">
                  <span className="text-[16px] text-[#0d0d0d] tracking-[-0.32px] leading-[1.2]">
                    {asset.name}
                  </span>
                  <span className="text-[14px] text-[#999999] tracking-[-0.28px] leading-[1.2]">
                    {asset.amount.toFixed(asset.symbol === 'BTC' ? 8 : 4).replace(/\.?0+$/, '')} {asset.symbol}
                  </span>
                </div>
                
                {/* Right side: Value and performance */}
                <div className="relative z-10 flex flex-col items-end gap-[2px]">
                  <SlotNumber 
                    value={asset.currentValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    prefix="$"
                    className="text-[16px] text-[#0d0d0d] tracking-[-0.32px] leading-[1.2]"
                  />
                  <div className="flex items-center gap-[2px]">
                    <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none">
                      <path 
                        d={asset.performance >= 0 ? "M6 2v8M3 5l3-3 3 3" : "M6 10V2M3 7l3 3 3-3"} 
                        stroke={asset.performance >= 0 ? '#2ac737' : '#c73737'} 
                        strokeWidth="1.5" 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                      />
                    </svg>
                    <SlotNumber 
                      value={Math.abs(asset.performance).toFixed(2)}
                      suffix="%"
                      className={`text-[14px] tracking-[-0.28px] leading-[1.2] ${asset.performance >= 0 ? 'text-[#2ac737]' : 'text-[#c73737]'}`}
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Deposit card - only show when user has no assets */}
      <AnimatePresence>
        {!hasAssets && (
          <motion.div
            className="relative overflow-hidden rounded-[24px] cursor-pointer"
            style={{
              width: '100%',
              maxWidth: '370px',
              height: '120px',
              boxShadow: '0px 12px 24px 0px rgba(236, 121, 82, 0.1), 0px 48px 48px 0px rgba(236, 121, 82, 0.1), 0px 110px 66px 0px rgba(236, 121, 82, 0.05)',
            }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            transition={{ delay: 0.25 }}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={handleBuyClick}
          >
            {/* Background image */}
            <div 
              className="absolute inset-0"
              style={{ 
                backgroundImage: 'url(/deposit-card.png)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
              }}
            />

            {/* Content */}
            <div className="relative z-10 h-full flex flex-col justify-center p-5">
              <p 
                className="text-[16px] text-white w-[140px] leading-[1.2] mb-2"
                style={{ 
                  fontFamily: 'Exposure, sans-serif',
                  textShadow: '0px 0px 8px rgba(255, 255, 255, 0.5)' 
                }}
              >
                Start your dawn journey
              </p>
              
              <motion.button
                className="self-start px-4 h-9 rounded-full text-[15px] font-medium text-white"
                style={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.25)',
                  marginLeft: '-4px'
                }}
                whileTap={{ scale: 0.95 }}
              >
                Buy Crypto
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>

    {/* Buy Modal */}
    <BuyModal 
      isOpen={isBuyModalOpen}
      onClose={() => setIsBuyModalOpen(false)}
    />
    </>
  );
}
