'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { WindowId, useWindowStore } from '@/stores/windowStore';

const dockItems: { id: WindowId; label: string; icon: string; iconFill: string }[] = [
  { id: 'wallet', label: 'Dashboard', icon: '/icons/home.svg', iconFill: '/icons/home-fill.svg' },
  { id: 'transactions', label: 'Activity', icon: '/icons/clock.svg', iconFill: '/icons/clock-fill.svg' },
  { id: 'nfts', label: 'Profile', icon: '/icons/people.svg', iconFill: '/icons/people-fill.svg' },
  { id: 'swap', label: 'Swaps', icon: '/icons/arrows.svg', iconFill: '/icons/arrows-fill.svg' },
];

export default function Dock() {
  const windows = useWindowStore((state) => state.windows);
  const openWindow = useWindowStore((state) => state.openWindow);
  const restoreWindow = useWindowStore((state) => state.restoreWindow);

  const handleClick = (id: WindowId) => {
    const window = windows[id];
    if (!window.isOpen) {
      openWindow(id);
    } else if (window.isMinimized) {
      restoreWindow(id);
    }
  };

  return (
    <motion.div
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999]"
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 30,
        delay: 0.2,
      }}
    >
      <div
        className="flex items-center gap-2 px-4 py-3 bg-white/80 backdrop-blur-xl rounded-[20px]"
        style={{
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(0, 0, 0, 0.05)',
        }}
      >
        {dockItems.map((item) => {
          const window = windows[item.id];
          const isActive = window.isOpen && !window.isMinimized;
          
          return (
            <motion.button
              key={item.id}
              onClick={() => handleClick(item.id)}
              className="relative flex flex-col items-center gap-1 group"
              whileHover={{ scale: 1.15, y: -8 }}
              whileTap={{ scale: 0.95 }}
              transition={{
                type: 'spring',
                stiffness: 400,
                damping: 20,
              }}
            >
              {/* Icon container */}
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-br from-orange-400 to-orange-500 shadow-lg shadow-orange-500/30'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                <Image
                  src={isActive ? item.iconFill : item.icon}
                  alt={item.label}
                  width={24}
                  height={24}
                  className={isActive ? 'brightness-0 invert' : ''}
                />
              </div>

              {/* Tooltip */}
              <motion.span
                className="absolute -top-8 px-2 py-1 text-xs font-medium text-white bg-gray-900 rounded-md opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none"
                initial={{ opacity: 0, y: 4 }}
                whileHover={{ opacity: 1, y: 0 }}
              >
                {item.label}
              </motion.span>

              {/* Active indicator dot */}
              {window.isOpen && (
                <motion.div
                  className="absolute -bottom-1 w-1 h-1 rounded-full bg-orange-500"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}
