'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import Image from 'next/image';

interface EntryPageProps {
  onEnter: () => void;
}

export default function EntryPage({ onEnter }: EntryPageProps) {
  const [isExiting, setIsExiting] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0.5, y: 0.5 });

  // Track mouse for subtle parallax effect on the symbol
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleEnter = () => {
    setIsExiting(true);
    // Delay the actual transition to let the exit animation play
    setTimeout(onEnter, 800);
  };

  return (
    <AnimatePresence>
      {!isExiting && (
        <motion.div
          className="fixed inset-0 z-50 overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.1 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Animated gradient background */}
          <motion.div
            className="absolute inset-0"
            animate={{
              background: [
                'linear-gradient(180deg, #FF9F43 0%, #FF7F50 50%, #FFA366 100%)',
                'linear-gradient(180deg, #FFB366 0%, #FF8C42 50%, #FF9955 100%)',
                'linear-gradient(180deg, #FF9F43 0%, #FF7F50 50%, #FFA366 100%)',
              ],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />

          {/* Dawn symbol background with blur effect */}
          <motion.div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
            style={{
              x: (mousePosition.x - 0.5) * 30,
              y: (mousePosition.y - 0.5) * 30,
            }}
          >
            {/* Blurred dawn symbol */}
            <motion.div
              className="relative"
              style={{
                width: '90vmin',
                height: '90vmin',
                filter: 'blur(60px)',
                opacity: 0.7,
              }}
              animate={{
                scale: [1, 1.05, 1],
                opacity: [0.6, 0.75, 0.6],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <Image
                src="/hero/dawn-symbol.svg"
                alt=""
                fill
                className="object-contain"
                style={{
                  filter: 'brightness(0.6) saturate(1.2)',
                }}
              />
            </motion.div>
          </motion.div>

          {/* Content overlay */}
          <div className="relative z-10 flex flex-col items-center justify-center h-full px-6">
            {/* Dawn logo - centered, white */}
            <motion.div
              className="absolute top-8 left-1/2 -translate-x-1/2"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              <Image
                src="/dawn-logo.svg"
                alt="Dawn"
                width={100}
                height={28}
                className="brightness-0 invert"
              />
            </motion.div>

            {/* Main headline - Exposure font, -4% tracking, white glow */}
            <motion.h1
              className="text-white text-4xl md:text-5xl lg:text-6xl font-bold text-center mb-8"
              style={{ 
                fontFamily: 'Exposure, var(--font-suisse), system-ui, sans-serif',
                letterSpacing: '-0.04em',
                textShadow: '0 0 30px rgba(255, 255, 255, 0.5), 0 0 60px rgba(255, 255, 255, 0.3), 0 0 90px rgba(255, 255, 255, 0.2)',
              }}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              A fresh start for your money
            </motion.h1>

            {/* Enter button */}
            <motion.button
              onClick={handleEnter}
              className="group relative px-8 py-4 bg-white/90 backdrop-blur-sm rounded-full text-[#E85A24] font-semibold text-lg shadow-lg hover:bg-white hover:shadow-xl transition-all duration-300"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="relative z-10 flex items-center gap-2">
                Enter Dawn
                <motion.svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  animate={{ x: [0, 4, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </motion.svg>
              </span>
            </motion.button>
          </div>

          {/* Footer */}
          <motion.div
            className="absolute bottom-6 left-0 right-0 flex justify-between items-center px-6 text-white/60 text-xs"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1, duration: 0.8 }}
          >
            <span className="font-mono tracking-wider">DAWN WALLET</span>
            <span>Built with ☀️</span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

