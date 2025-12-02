'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ReactNode, useState, useRef, useEffect } from 'react';
import { WindowId, useWindowStore } from '@/stores/windowStore';

interface WindowProps {
  id: WindowId;
  title?: string;
  children: ReactNode;
}

export default function Window({ id, title, children }: WindowProps) {
  const window = useWindowStore((state) => state.windows[id]);
  const bringToFront = useWindowStore((state) => state.bringToFront);
  const closeWindow = useWindowStore((state) => state.closeWindow);
  const minimizeWindow = useWindowStore((state) => state.minimizeWindow);
  const updateSize = useWindowStore((state) => state.updateSize);
  const updatePosition = useWindowStore((state) => state.updatePosition);
  const flashingWindow = useWindowStore((state) => state.flashingWindow);
  const clearFlash = useWindowStore((state) => state.clearFlash);

  const [isDragging, setIsDragging] = useState(false);
  const [flashKey, setFlashKey] = useState(0);
  const [isFlashing, setIsFlashing] = useState(false);
  const [isHoveringControls, setIsHoveringControls] = useState(false);
  const [isEnlarged, setIsEnlarged] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [customTitle, setCustomTitle] = useState<string | null>(null);
  const [position, setPosition] = useState({ x: window.position.x, y: window.position.y });
  const [dockTarget, setDockTarget] = useState({ x: 500, y: 900 });
  const positionRef = useRef(position);
  const dragStartRef = useRef({ mouseX: 0, mouseY: 0, posX: 0, posY: 0 });
  const originalSizeRef = useRef({ width: window.size.width, height: window.size.height });
  const titleInputRef = useRef<HTMLInputElement>(null);

  // Calculate dock target position on client side only
  useEffect(() => {
    if (typeof globalThis.window !== 'undefined') {
      setDockTarget({
        x: globalThis.window.innerWidth / 2 - 50,
        y: globalThis.window.innerHeight - 80,
      });
    }
  }, []);

  useEffect(() => {
    if (flashingWindow === id) {
      // Increment key to force animation restart
      setFlashKey(prev => prev + 1);
      setIsFlashing(true);
      clearFlash();
      const timer = setTimeout(() => {
        setIsFlashing(false);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [flashingWindow, id, clearFlash]);

  useEffect(() => {
    positionRef.current = position;
  }, [position]);

  useEffect(() => {
    if (!isDragging) {
      setPosition({ x: window.position.x, y: window.position.y });
    }
  }, [window.position.x, window.position.y, isDragging]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;
    
    e.preventDefault();
    bringToFront(id);
    setIsDragging(true);
    
    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      posX: positionRef.current.x,
      posY: positionRef.current.y,
    };

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - dragStartRef.current.mouseX;
      const deltaY = e.clientY - dragStartRef.current.mouseY;
      const newPos = {
        x: dragStartRef.current.posX + deltaX,
        y: dragStartRef.current.posY + deltaY,
      };
      setPosition(newPos);
      positionRef.current = newPos;
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      updatePosition(id, positionRef.current);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // Focus input when editing starts - must be before any early returns
  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [isEditingTitle]);

  const handleEnlarge = () => {
    if (!isEnlarged) {
      originalSizeRef.current = { width: window.size.width, height: window.size.height };
      updateSize(id, {
        width: Math.round(window.size.width * 1.25),
        height: Math.round(window.size.height * 1.25),
      });
    } else {
      updateSize(id, originalSizeRef.current);
    }
    setIsEnlarged(!isEnlarged);
  };

  const defaultTitles: Record<WindowId, string> = {
    wallet: 'Your wallet',
    send: 'Send',
    receive: 'Receive',
    swap: 'Swap',
    transactions: 'Activity',
    nfts: 'NFT Gallery',
  };

  const displayTitle = customTitle || title || defaultTitles[id] || 'Window';

  // Early return after all hooks
  if (!window.isOpen) return null;

  const handleTitleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditingTitle(true);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomTitle(e.target.value);
  };

  const handleTitleBlur = () => {
    setIsEditingTitle(false);
    if (customTitle?.trim() === '') {
      setCustomTitle(null);
    }
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      setIsEditingTitle(false);
      if (customTitle?.trim() === '') {
        setCustomTitle(null);
      }
    }
    if (e.key === 'Escape') {
      setIsEditingTitle(false);
      setCustomTitle(null);
    }
  };

  // Genie effect animation variants with transitions
  const genieVariants = {
    open: {
      opacity: 1,
      scale: 1,
      x: 0,
      y: 0,
      scaleX: 1,
      scaleY: 1,
      transformOrigin: 'bottom center',
      transition: {
        type: 'spring' as const,
        stiffness: 400,
        damping: 30,
        mass: 0.8,
      },
    },
    minimized: {
      opacity: 0,
      scale: 0.05,
      x: dockTarget.x - position.x - (window.size.width / 2),
      y: dockTarget.y - position.y,
      scaleX: 0.15,
      scaleY: 0.02,
      transformOrigin: 'bottom center',
      transition: {
        type: 'tween' as const,
        duration: 0.45,
        ease: [0.32, 0, 0.67, 0] as const,
      },
    },
    initial: {
      opacity: 0,
      scale: 0.3,
      x: 0,
      y: 30,
      scaleX: 0.9,
      scaleY: 0.9,
      transformOrigin: 'center center',
    },
  };

  const openTransition = {
    type: 'spring' as const,
    stiffness: 400,
    damping: 30,
    mass: 0.8,
  };

  return (
    <AnimatePresence mode="wait">
      {!window.isMinimized && (
        <motion.div
          key={`window-${id}`}
          className="fixed select-none"
          style={{
            left: position.x,
            top: position.y,
            zIndex: window.zIndex,
            cursor: isDragging ? 'grabbing' : 'default',
            perspective: '1000px',
          }}
          variants={genieVariants}
          initial="initial"
          animate="open"
          exit="minimized"
          transition={openTransition}
          onPointerDown={() => bringToFront(id)}
        >
          <motion.div
            animate={{
              width: window.size.width + 24,
            }}
            transition={{
              type: 'spring',
              stiffness: 200,
              damping: 25,
            }}
          >
            {/* Outer frosted glass frame - GPU accelerated */}
            <div
              className={`rounded-[24px] overflow-hidden relative ${isFlashing ? 'animate-pulse-scale' : ''}`}
              style={{
                background: 'linear-gradient(180deg, rgba(235, 235, 235, 0.6) 0%, rgba(215, 215, 215, 0.55) 100%)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                boxShadow: isDragging 
                  ? '0 25px 80px rgba(0, 0, 0, 0.35), 0 8px 24px rgba(0, 0, 0, 0.2), inset 0 1px 1px rgba(255,255,255,0.9), inset 0 -1px 1px rgba(255,255,255,0.3)'
                  : '0 15px 60px rgba(0, 0, 0, 0.2), 0 5px 20px rgba(0, 0, 0, 0.12), inset 0 1px 1px rgba(255,255,255,0.9), inset 0 -1px 1px rgba(255,255,255,0.3)',
                padding: '6px',
                transform: 'translateZ(0)',
                willChange: 'transform',
                contain: 'layout style paint',
              }}
            >
              {/* Shine effect overlay */}
              {isFlashing && (
                <div key={flashKey} className="absolute inset-0 pointer-events-none z-50 overflow-hidden rounded-[24px]">
                  <div 
                    className="absolute top-0 bottom-0 animate-shine"
                    style={{
                      background: 'linear-gradient(100deg, transparent 0%, transparent 25%, rgba(255, 255, 255, 1) 45%, rgba(255, 255, 255, 1) 55%, transparent 75%, transparent 100%)',
                      width: '100%',
                    }}
                  />
                </div>
              )}

              {/* Title bar area */}
              <div
                className="flex items-center h-10 px-3 mb-1 select-none"
                style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
                onMouseDown={handleMouseDown}
              >
                {/* macOS Lion-style 3D traffic light buttons */}
                <div 
                  className="flex items-center gap-[7px]"
                  onMouseEnter={() => setIsHoveringControls(true)}
                  onMouseLeave={() => setIsHoveringControls(false)}
                >
                  {/* Close button - Red */}
                  <motion.button
                    onClick={(e) => {
                      e.stopPropagation();
                      closeWindow(id);
                    }}
                    className="group relative w-[14px] h-[14px] rounded-full flex items-center justify-center pointer-events-auto overflow-hidden"
                    style={{
                      background: 'linear-gradient(180deg, #FF6B5E 0%, #E5453C 50%, #CC2F26 100%)',
                      boxShadow: 'inset 0 2px 3px rgba(255,255,255,0.4), inset 0 -2px 3px rgba(0,0,0,0.2), 0 1px 3px rgba(0,0,0,0.3), 0 0 0 0.5px rgba(0,0,0,0.15)',
                      border: '0.5px solid rgba(0,0,0,0.2)',
                    }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <div 
                      className="absolute inset-0 rounded-full bg-black opacity-0 group-hover:opacity-[0.03] transition-opacity duration-100"
                    />
                    <div 
                      className="absolute top-[1px] left-[2px] w-[8px] h-[6px] rounded-full"
                      style={{
                        background: 'linear-gradient(180deg, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0) 100%)',
                      }}
                    />
                    <div 
                      className="absolute bottom-[2px] right-[2px] w-[4px] h-[3px] rounded-full opacity-30"
                      style={{ background: 'rgba(255,255,255,0.5)' }}
                    />
                    {isHoveringControls && (
                      <svg width="8" height="8" viewBox="0 0 8 8" fill="none" className="relative z-10">
                        <path d="M1.5 1.5L6.5 6.5M6.5 1.5L1.5 6.5" stroke="rgba(80,0,0,0.6)" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                    )}
                  </motion.button>

                  {/* Minimize button - Yellow */}
                  <motion.button
                    onClick={(e) => {
                      e.stopPropagation();
                      minimizeWindow(id);
                    }}
                    className="group relative w-[14px] h-[14px] rounded-full flex items-center justify-center pointer-events-auto overflow-hidden"
                    style={{
                      background: 'linear-gradient(180deg, #FFCA2B 0%, #E5A820 50%, #CC8F10 100%)',
                      boxShadow: 'inset 0 2px 3px rgba(255,255,255,0.4), inset 0 -2px 3px rgba(0,0,0,0.15), 0 1px 3px rgba(0,0,0,0.3), 0 0 0 0.5px rgba(0,0,0,0.15)',
                      border: '0.5px solid rgba(0,0,0,0.2)',
                    }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <div 
                      className="absolute inset-0 rounded-full bg-black opacity-0 group-hover:opacity-[0.03] transition-opacity duration-100"
                    />
                    <div 
                      className="absolute top-[1px] left-[2px] w-[8px] h-[6px] rounded-full"
                      style={{
                        background: 'linear-gradient(180deg, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0) 100%)',
                      }}
                    />
                    <div 
                      className="absolute bottom-[2px] right-[2px] w-[4px] h-[3px] rounded-full opacity-30"
                      style={{ background: 'rgba(255,255,255,0.5)' }}
                    />
                    {isHoveringControls && (
                      <svg width="8" height="8" viewBox="0 0 8 8" fill="none" className="relative z-10">
                        <path d="M1.5 4H6.5" stroke="rgba(100,70,0,0.6)" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                    )}
                  </motion.button>

                  {/* Maximize/Enlarge button - Green */}
                  <motion.button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEnlarge();
                    }}
                    className="group relative w-[14px] h-[14px] rounded-full flex items-center justify-center pointer-events-auto overflow-hidden"
                    style={{
                      background: 'linear-gradient(180deg, #5DD043 0%, #34B51E 50%, #249A0F 100%)',
                      boxShadow: 'inset 0 2px 3px rgba(255,255,255,0.4), inset 0 -2px 3px rgba(0,0,0,0.15), 0 1px 3px rgba(0,0,0,0.3), 0 0 0 0.5px rgba(0,0,0,0.15)',
                      border: '0.5px solid rgba(0,0,0,0.2)',
                    }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <div 
                      className="absolute inset-0 rounded-full bg-black opacity-0 group-hover:opacity-[0.03] transition-opacity duration-100"
                    />
                    <div 
                      className="absolute top-[1px] left-[2px] w-[8px] h-[6px] rounded-full"
                      style={{
                        background: 'linear-gradient(180deg, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0) 100%)',
                      }}
                    />
                    <div 
                      className="absolute bottom-[2px] right-[2px] w-[4px] h-[3px] rounded-full opacity-30"
                      style={{ background: 'rgba(255,255,255,0.5)' }}
                    />
                    {isHoveringControls && (
                      <svg width="8" height="8" viewBox="0 0 8 8" fill="none" className="relative z-10">
                        <path d="M1.5 4H6.5M4 1.5V6.5" stroke="rgba(0,80,0,0.6)" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                    )}
                  </motion.button>
                </div>

                {/* Window title - clickable to edit */}
                <div className="flex-1 text-center">
                  {isEditingTitle ? (
                    <input
                      ref={titleInputRef}
                      type="text"
                      value={customTitle ?? displayTitle}
                      onChange={handleTitleChange}
                      onBlur={handleTitleBlur}
                      onKeyDown={handleTitleKeyDown}
                      className="text-[16px] font-medium text-[#404040] tracking-[-0.32px] bg-transparent border-none outline-none text-center w-full px-2"
                      style={{ textShadow: '0 1px 0 rgba(255,255,255,0.6)' }}
                    />
                  ) : (
                    <span 
                      className="text-[16px] font-medium text-[#404040] tracking-[-0.32px] cursor-text hover:text-[#303030] transition-colors"
                      style={{ textShadow: '0 1px 0 rgba(255,255,255,0.6)' }}
                      onClick={handleTitleClick}
                    >
                      {displayTitle}
                    </span>
                  )}
                </div>

                <div className="w-[55px]" />
              </div>

              {/* Inner content window - GPU accelerated */}
              <motion.div
                className="rounded-[18px] overflow-hidden"
                style={{
                  backgroundColor: 'rgba(250, 250, 250, 0.92)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.8), inset 0 -1px 2px rgba(255,255,255,0.4), 0 1px 0 rgba(255,255,255,0.3)',
                  transform: 'translateZ(0)',
                  willChange: 'transform, height',
                  contain: 'layout style paint',
                }}
                animate={{
                  height: window.size.height - 60,
                }}
                transition={{
                  type: 'spring',
                  stiffness: 200,
                  damping: 25,
                }}
              >
                <div className="overflow-auto h-full">
                  {children}
                </div>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
