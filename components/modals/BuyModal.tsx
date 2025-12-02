'use client';

import { useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { usePortfolioStore } from '@/stores/portfolioStore';
import { useCryptoPrices } from '@/hooks/useCryptoPrices';

interface BuyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPurchase?: (asset: string, usdAmount: number, cryptoAmount: number) => void;
}

const assetsList = [
  { id: 'BTC', name: 'Bitcoin', icon: '/icons/assets/Logos/Tokens.svg' },
  { id: 'SOL', name: 'Solana', icon: '/icons/assets/Logos/Tokens-1.svg' },
  { id: 'USDC', name: 'USDC', icon: '/icons/assets/Logos/Tokens-2.svg' },
  { id: 'USDT', name: 'USDT', icon: '/icons/assets/Logos/Tokens-3.svg' },
];

const quickAmounts = [100, 500, 1000];

export default function BuyModal({ isOpen, onClose, onPurchase }: BuyModalProps) {
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState<'select' | 'amount'>('select');
  const [selectedAsset, setSelectedAsset] = useState<typeof assetsList[0] | null>(null);
  const [amount, setAmount] = useState('0');
  const [isUsdMode, setIsUsdMode] = useState(true);
  const swap = usePortfolioStore((state) => state.swap);
  const usdcBalance = usePortfolioStore((state) => state.balances.USDC?.amount ?? 0);
  
  // Get live prices
  const { prices, loading: pricesLoading } = useCryptoPrices(5000);
  
  // Get current price for selected asset
  const currentPrice = selectedAsset 
    ? prices[selectedAsset.id as keyof typeof prices] ?? 0
    : 0;

  useEffect(() => {
    setMounted(true);
  }, []);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setStep('select');
      setSelectedAsset(null);
      setAmount('0');
      setIsUsdMode(true);
    }
  }, [isOpen]);

  const handleAssetSelect = (asset: typeof assetsList[0]) => {
    setSelectedAsset(asset);
    setStep('amount');
  };

  const handleKeyPress = useCallback((key: string) => {
    if (key === 'backspace') {
      setAmount(prev => prev.length > 1 ? prev.slice(0, -1) : '0');
    } else if (key === '.') {
      if (!amount.includes('.')) {
        setAmount(prev => prev + '.');
      }
    } else {
      // Number key
      setAmount(prev => {
        if (prev === '0' && key !== '.') {
          return key;
        }
        // Limit decimal places
        const parts = prev.split('.');
        if (parts[1] && parts[1].length >= 2) {
          return prev;
        }
        return prev + key;
      });
    }
  }, [amount]);

  const handleQuickAmount = (value: number) => {
    setAmount(value.toString());
    setIsUsdMode(true);
  };

  const toggleMode = () => {
    setIsUsdMode(prev => !prev);
    // Convert the amount when switching modes
    if (selectedAsset && currentPrice > 0) {
      const numAmount = parseFloat(amount) || 0;
      if (isUsdMode) {
        // Converting from USD to crypto
        const cryptoAmt = numAmount / currentPrice;
        setAmount(cryptoAmt.toFixed(8).replace(/\.?0+$/, '') || '0');
      } else {
        // Converting from crypto to USD
        const usdAmt = numAmount * currentPrice;
        setAmount(usdAmt.toFixed(2));
      }
    }
  };

  const displayAmount = parseFloat(amount) || 0;
  const cryptoAmount = selectedAsset && currentPrice > 0
    ? (isUsdMode ? displayAmount / currentPrice : displayAmount)
    : 0;
  const usdAmount = selectedAsset && currentPrice > 0
    ? (isUsdMode ? displayAmount : displayAmount * currentPrice)
    : 0;

  const handleBack = () => {
    setStep('select');
    setAmount('0');
    setIsUsdMode(true);
  };

  const handleContinue = () => {
    if (selectedAsset && usdAmount > 0 && usdAmount <= usdcBalance && currentPrice > 0) {
      // Perform the swap: USDC -> selected asset (pass current price for tracking)
      swap('USDC', selectedAsset.id, usdAmount, currentPrice);
      
      // Call optional callback
      if (onPurchase) {
        onPurchase(selectedAsset.id, usdAmount, cryptoAmount);
      }
      
      onClose();
    }
  };
  
  const insufficientFunds = usdAmount > usdcBalance;

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop overlay */}
          <motion.div
            className="fixed inset-0 z-[10000] backdrop-blur-sm"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed left-1/2 top-1/2 z-[10001] w-full max-w-[400px] pointer-events-none"
            style={{ x: '-50%', y: '-50%' }}
          >
            <motion.div 
              className="relative overflow-hidden rounded-[32px] pointer-events-auto"
              style={{
                backgroundColor: 'rgba(247, 247, 247, 0.95)',
                backdropFilter: 'blur(24px)',
                boxShadow: '0px 8px 32px 0px rgba(0, 0, 0, 0.12)',
              }}
              initial={{ opacity: 0, scale: 0.92, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 10 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              layout
              layoutId="buy-modal"
            >

              <AnimatePresence mode="wait" initial={false}>
                {step === 'select' ? (
                  <motion.div
                    key="select"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                  >
                    {/* Header */}
                    <div className="relative flex items-center justify-center h-16 px-4">
                      <h2 className="text-[18px] font-medium text-[#0d0d0d] tracking-[-0.36px]">
                        Choose asset to buy
                      </h2>
                      
                      {/* Close button */}
                      <motion.button
                        className="absolute right-4 w-9 h-9 rounded-full flex items-center justify-center"
                        style={{
                          backgroundColor: '#fafafa',
                          boxShadow: '0px 0px 14.4px 0px rgba(0, 0, 0, 0.08)',
                        }}
                        onClick={onClose}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <div 
                          className="absolute inset-0 rounded-full pointer-events-none"
                          style={{ boxShadow: 'inset 0px 0.9px 0.9px 0px #ffffff' }}
                        />
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                          <path 
                            d="M8 8L16 16M16 8L8 16" 
                            stroke="#1F1F1F" 
                            strokeWidth="2" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                          />
                        </svg>
                      </motion.button>
                    </div>

                    {/* Asset grid */}
                    <div className="px-4 pb-8 pt-2">
                      <div className="flex flex-wrap gap-1 justify-center">
                        {assetsList.map((asset, index) => (
                          <motion.button
                            key={asset.id}
                            className="relative w-[175px] h-24 rounded-[24px] flex flex-col items-center justify-center gap-2 overflow-hidden"
                            style={{ backgroundColor: '#f7f7f7' }}
                            initial={{ 
                              opacity: 0, 
                              y: 20,
                              boxShadow: '0px 2px 16px 0px rgba(0, 0, 0, 0.05)' 
                            }}
                            animate={{ 
                              opacity: 1, 
                              y: 0,
                              boxShadow: '0px 2px 16px 0px rgba(0, 0, 0, 0.05)' 
                            }}
                            exit={{ opacity: 0, y: 20 }}
                            transition={{ 
                              delay: index * 0.05,
                              duration: 0.2,
                            }}
                            whileHover={{ boxShadow: 'none' }}
                            whileTap={{ boxShadow: 'none', scale: 0.98 }}
                            onClick={() => handleAssetSelect(asset)}
                          >
                            <div 
                              className="absolute inset-0 pointer-events-none rounded-[24px]"
                              style={{ boxShadow: 'inset 0px 2px 2px 0px #ffffff' }}
                            />
                            <Image
                              src={asset.icon}
                              alt={asset.name}
                              width={32}
                              height={32}
                            />
                            <span className="text-[16px] font-medium text-[#0d0d0d] tracking-[-0.32px]">
                              {asset.name}
                            </span>
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="amount"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                  >
                    {/* Header */}
                    <div className="relative flex items-center justify-center h-16 px-4">
                      {/* Back button */}
                      <motion.button
                        className="absolute left-4 w-9 h-9 rounded-full flex items-center justify-center"
                        style={{
                          backgroundColor: '#fafafa',
                          boxShadow: '0px 0px 14.4px 0px rgba(0, 0, 0, 0.08)',
                        }}
                        onClick={handleBack}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <div 
                          className="absolute inset-0 rounded-full pointer-events-none"
                          style={{ boxShadow: 'inset 0px 0.9px 0.9px 0px #ffffff' }}
                        />
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                          <path 
                            d="M15 18L9 12L15 6" 
                            stroke="#1F1F1F" 
                            strokeWidth="2" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                          />
                        </svg>
                      </motion.button>

                      <h2 className="text-[18px] font-medium text-[#0d0d0d] tracking-[-0.36px]">
                        Buy {selectedAsset?.name}
                      </h2>
                      
                      {/* Close button */}
                      <motion.button
                        className="absolute right-4 w-9 h-9 rounded-full flex items-center justify-center"
                        style={{
                          backgroundColor: '#fafafa',
                          boxShadow: '0px 0px 14.4px 0px rgba(0, 0, 0, 0.08)',
                        }}
                        onClick={onClose}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <div 
                          className="absolute inset-0 rounded-full pointer-events-none"
                          style={{ boxShadow: 'inset 0px 0.9px 0.9px 0px #ffffff' }}
                        />
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                          <path 
                            d="M8 8L16 16M16 8L8 16" 
                            stroke="#1F1F1F" 
                            strokeWidth="2" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                          />
                        </svg>
                      </motion.button>
                    </div>

                    {/* Amount display */}
                    <div className="flex flex-col items-center py-6 gap-4">
                      <motion.p
                        className="text-[42px] font-medium tracking-[0.84px]"
                        style={{ color: displayAmount > 0 ? '#0d0d0d' : '#cccccc' }}
                        key={amount}
                        initial={{ scale: 0.95 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.1 }}
                      >
                        {isUsdMode ? `$${displayAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : `${displayAmount} ${selectedAsset?.id}`}
                      </motion.p>
                      
                      {/* Crypto equivalent with toggle */}
                      <motion.button
                        className="flex items-center gap-1 text-[16px] tracking-[-0.32px] text-[#b3b3b3]"
                        onClick={toggleMode}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <span>
                          {isUsdMode 
                            ? `${cryptoAmount.toFixed(8).replace(/\.?0+$/, '') || '0'} ${selectedAsset?.id}` 
                            : `$${usdAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                          }
                        </span>
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                          <path 
                            d="M10 4V16M10 4L6 8M10 4L14 8M10 16L6 12M10 16L14 12" 
                            stroke="#b3b3b3" 
                            strokeWidth="1.5" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                          />
                        </svg>
                      </motion.button>
                    </div>

                    {/* Quick amount buttons */}
                    <div className="flex justify-center gap-2 pb-4">
                      {quickAmounts.map((value) => (
                        <motion.button
                          key={value}
                          className="px-3 h-9 rounded-full text-[16px] tracking-[-0.32px] text-[#0d0d0d]"
                          style={{
                            backgroundColor: '#ffffff',
                            boxShadow: '0px 0px 16px 0px rgba(0, 0, 0, 0.05)',
                          }}
                          onClick={() => handleQuickAmount(value)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <div 
                            className="absolute inset-0 rounded-full pointer-events-none"
                            style={{ boxShadow: 'inset 0px 1px 1px 0px #ffffff' }}
                          />
                          ${value}
                        </motion.button>
                      ))}
                    </div>

                    {/* Payment method card */}
                    <div className="px-4 pb-4">
                      <div 
                        className="relative rounded-[40px] p-2 flex flex-col gap-1 overflow-hidden"
                        style={{
                          backgroundColor: '#e5f3e5',
                          boxShadow: '0px 0px 16px 0px rgba(0, 0, 0, 0.08)',
                        }}
                      >
                        <div className="flex items-center justify-center gap-1.5 py-1 px-2">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="10" fill="#2AC737"/>
                            <path d="M8 12L11 15L16 9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          <span className="text-[14px] tracking-[-0.28px] text-[#2ac737]">
                            Recommended payment method
                          </span>
                        </div>
                        <div 
                          className="relative h-16 rounded-full flex items-center gap-2 px-4"
                          style={{
                            backgroundColor: '#ffffff',
                            boxShadow: '0px 2px 16px 0px rgba(0, 0, 0, 0.05)',
                          }}
                        >
                          <Image
                            src="/icons/assets/Logos/Tokens-2.svg"
                            alt="USDC"
                            width={32}
                            height={32}
                          />
                          <span className="text-[16px] tracking-[-0.32px] text-[#0d0d0d]">
                            USDC
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Numpad */}
                    <div className="grid grid-cols-3 gap-0 px-4">
                      {['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'backspace'].map((key) => (
                        <motion.button
                          key={key}
                          className="h-16 flex items-center justify-center text-[24px] tracking-[-0.48px] text-[#0d0d0d]"
                          onClick={() => handleKeyPress(key)}
                          whileTap={{ scale: 0.95, backgroundColor: 'rgba(0,0,0,0.05)' }}
                        >
                          {key === 'backspace' ? (
                            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                              <path 
                                d="M22 7H10L5 14L10 21H22C23.1 21 24 20.1 24 19V9C24 7.9 23.1 7 22 7Z" 
                                stroke="#0d0d0d" 
                                strokeWidth="2" 
                                strokeLinecap="round" 
                                strokeLinejoin="round"
                              />
                              <path 
                                d="M18 11L14 15M14 11L18 15" 
                                stroke="#0d0d0d" 
                                strokeWidth="2" 
                                strokeLinecap="round" 
                                strokeLinejoin="round"
                              />
                            </svg>
                          ) : key}
                        </motion.button>
                      ))}
                    </div>

                    {/* Continue button */}
                    <div className="p-4 pt-2">
                      <motion.button
                        className="w-full h-14 rounded-full text-[17px] tracking-[-0.34px] text-white font-medium relative overflow-hidden"
                        style={{
                          backgroundColor: displayAmount > 0 && !insufficientFunds ? '#0d0d0d' : '#cccccc',
                        }}
                        onClick={handleContinue}
                        whileHover={displayAmount > 0 && !insufficientFunds ? { scale: 1.02 } : {}}
                        whileTap={displayAmount > 0 && !insufficientFunds ? { scale: 0.98 } : {}}
                        disabled={displayAmount <= 0 || insufficientFunds}
                      >
                        <div 
                          className="absolute inset-0 rounded-full pointer-events-none"
                          style={{ boxShadow: 'inset 0px 2px 0px 0px rgba(255, 255, 255, 0.75)' }}
                        />
                        {insufficientFunds ? 'Insufficient USDC' : 'Continue'}
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
