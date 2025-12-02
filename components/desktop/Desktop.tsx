'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import Image from 'next/image';
import Dock from './Dock';
import { usePortfolioStore } from '@/stores/portfolioStore';
import { useWindowStore } from '@/stores/windowStore';

interface DesktopProps {
  children: ReactNode;
}

export default function Desktop({ children }: DesktopProps) {
  const usdcBalance = usePortfolioStore((state) => state.balances.USDC?.amount ?? 0);
  const walletWindow = useWindowStore((state) => state.windows.wallet);
  const openWindow = useWindowStore((state) => state.openWindow);
  const bringToFront = useWindowStore((state) => state.bringToFront);
  const flashWindow = useWindowStore((state) => state.flashWindow);

  const handleSpendClick = () => {
    if (!walletWindow.isOpen || walletWindow.isMinimized) {
      openWindow('wallet');
    } else {
      bringToFront('wallet');
    }
    flashWindow('wallet');
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      {/* Base dark background */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 50%, #0f0f0f 100%)',
        }}
      />

      {/* Frosted glass overlay background - GPU accelerated */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(180deg, rgba(240, 240, 240, 0.88) 0%, rgba(225, 225, 225, 0.85) 100%)',
          backdropFilter: 'blur(40px)',
          WebkitBackdropFilter: 'blur(40px)',
          transform: 'translateZ(0)',
          willChange: 'transform',
        }}
      />

      {/* Subtle gradient accents */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse at 20% 20%, rgba(249, 115, 22, 0.05) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 80%, rgba(34, 197, 94, 0.05) 0%, transparent 50%),
            radial-gradient(ellipse at 50% 30%, rgba(255, 255, 255, 0.3) 0%, transparent 50%)
          `,
        }}
      />

      {/* Dawn logo / header */}
      <motion.header
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
      >
        {/* Logo */}
        <div className="flex items-center">
          <Image
            src="/dawn-logo.svg"
            alt="Dawn"
            width={100}
            height={28}
          />
        </div>

        {/* Center - USDC Balance Pill - GPU accelerated */}
        <motion.div
          className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2 pl-3 pr-1.5 py-1.5 rounded-full"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255,255,255,0.5)',
            transform: 'translateZ(0)',
          }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <Image
            src="/usdc.svg"
            alt="USDC"
            width={24}
            height={24}
            className="rounded-full"
          />
          <span className="text-[16px] font-medium text-gray-900">
            ${usdcBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <motion.button
            onClick={handleSpendClick}
            className="px-3 py-1.5 bg-[#0d0d0d] text-white text-[13px] font-medium rounded-full hover:bg-[#1a1a1a] transition-colors"
            style={{
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1), inset 0 -1px 0 rgba(0,0,0,0.3), 0 1px 3px rgba(0,0,0,0.2)',
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Spend
          </motion.button>
        </motion.div>

        {/* Right side links */}
        <nav className="flex items-center">
          <motion.a
            href="https://dawn.xyz"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 text-sm font-medium text-white bg-[#0d0d0d] rounded-full hover:bg-[#1a1a1a] transition-colors"
            style={{
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1), inset 0 -1px 0 rgba(0,0,0,0.3), 0 1px 3px rgba(0,0,0,0.2)',
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Download App
          </motion.a>
        </nav>
      </motion.header>

      {/* Decorative floating elements */}
      <motion.div
        className="absolute top-32 right-20 w-64 h-64 rounded-full opacity-40 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(249, 115, 22, 0.2) 0%, transparent 70%)',
        }}
        animate={{
          x: [0, 20, 0],
          y: [0, -10, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      
      <motion.div
        className="absolute bottom-40 left-20 w-48 h-48 rounded-full opacity-40 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(34, 197, 94, 0.2) 0%, transparent 70%)',
        }}
        animate={{
          x: [0, -15, 0],
          y: [0, 15, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Windows container */}
      <div className="relative w-full h-full pt-20 pb-24">
        {children}
      </div>

      {/* Dock */}
      <Dock />
    </div>
  );
}
