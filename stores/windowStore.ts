import { create } from 'zustand';

export type WindowId = 'wallet' | 'send' | 'receive' | 'swap' | 'transactions' | 'nfts';

export interface WindowState {
  id: WindowId;
  title: string;
  icon: string;
  isOpen: boolean;
  isMinimized: boolean;
  position: { x: number; y: number };
  size: { width: number; height: number };
  zIndex: number;
}

interface WindowStore {
  windows: Record<WindowId, WindowState>;
  highestZIndex: number;
  flashingWindow: WindowId | null;
  
  openWindow: (id: WindowId) => void;
  closeWindow: (id: WindowId) => void;
  minimizeWindow: (id: WindowId) => void;
  restoreWindow: (id: WindowId) => void;
  bringToFront: (id: WindowId) => void;
  updatePosition: (id: WindowId, position: { x: number; y: number }) => void;
  updateSize: (id: WindowId, size: { width: number; height: number }) => void;
  flashWindow: (id: WindowId) => void;
  clearFlash: () => void;
}

const initialWindows: Record<WindowId, WindowState> = {
  wallet: {
    id: 'wallet',
    title: 'Wallet',
    icon: '🏠',
    isOpen: true,
    isMinimized: false,
    position: { x: 80, y: 60 },
    size: { width: 380, height: 520 },
    zIndex: 1,
  },
  send: {
    id: 'send',
    title: 'Send',
    icon: '↗️',
    isOpen: false,
    isMinimized: false,
    position: { x: 500, y: 100 },
    size: { width: 380, height: 400 },
    zIndex: 0,
  },
  receive: {
    id: 'receive',
    title: 'Receive',
    icon: '↙️',
    isOpen: false,
    isMinimized: false,
    position: { x: 200, y: 150 },
    size: { width: 380, height: 450 },
    zIndex: 0,
  },
  swap: {
    id: 'swap',
    title: 'Swap',
    icon: '🔄',
    isOpen: false,
    isMinimized: false,
    position: { x: 350, y: 80 },
    size: { width: 400, height: 500 },
    zIndex: 0,
  },
  transactions: {
    id: 'transactions',
    title: 'History',
    icon: '📋',
    isOpen: false,
    isMinimized: false,
    position: { x: 600, y: 120 },
    size: { width: 420, height: 480 },
    zIndex: 0,
  },
  nfts: {
    id: 'nfts',
    title: 'NFTs',
    icon: '🖼️',
    isOpen: false,
    isMinimized: false,
    position: { x: 150, y: 100 },
    size: { width: 500, height: 550 },
    zIndex: 0,
  },
};

export const useWindowStore = create<WindowStore>((set) => ({
  windows: initialWindows,
  highestZIndex: 1,
  flashingWindow: null,

  openWindow: (id) =>
    set((state) => {
      const newZIndex = state.highestZIndex + 1;
      return {
        windows: {
          ...state.windows,
          [id]: {
            ...state.windows[id],
            isOpen: true,
            isMinimized: false,
            zIndex: newZIndex,
          },
        },
        highestZIndex: newZIndex,
      };
    }),

  closeWindow: (id) =>
    set((state) => ({
      windows: {
        ...state.windows,
        [id]: {
          ...state.windows[id],
          isOpen: false,
        },
      },
    })),

  minimizeWindow: (id) =>
    set((state) => ({
      windows: {
        ...state.windows,
        [id]: {
          ...state.windows[id],
          isMinimized: true,
        },
      },
    })),

  restoreWindow: (id) =>
    set((state) => {
      const newZIndex = state.highestZIndex + 1;
      return {
        windows: {
          ...state.windows,
          [id]: {
            ...state.windows[id],
            isMinimized: false,
            zIndex: newZIndex,
          },
        },
        highestZIndex: newZIndex,
      };
    }),

  bringToFront: (id) =>
    set((state) => {
      const newZIndex = state.highestZIndex + 1;
      return {
        windows: {
          ...state.windows,
          [id]: {
            ...state.windows[id],
            zIndex: newZIndex,
          },
        },
        highestZIndex: newZIndex,
      };
    }),

  updatePosition: (id, position) =>
    set((state) => ({
      windows: {
        ...state.windows,
        [id]: {
          ...state.windows[id],
          position,
        },
      },
    })),

  updateSize: (id, size) =>
    set((state) => ({
      windows: {
        ...state.windows,
        [id]: {
          ...state.windows[id],
          size,
        },
      },
    })),

  flashWindow: (id) =>
    set({ flashingWindow: id }),

  clearFlash: () =>
    set({ flashingWindow: null }),
}));

