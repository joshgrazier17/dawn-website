'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Desktop from '@/components/desktop/Desktop';
import Window from '@/components/desktop/Window';
import WalletOverview from '@/components/widgets/WalletOverview';
import SendCrypto from '@/components/widgets/SendCrypto';
import EntryPage from '@/components/entry/EntryPage';
import { useWindowStore } from '@/stores/windowStore';

// Placeholder widgets for future implementation
function ReceiveWidget() {
  return (
    <div className="p-5 text-center">
      <div className="w-32 h-32 mx-auto mb-4 bg-gray-100 rounded-2xl flex items-center justify-center">
        <span className="text-4xl">📱</span>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Receive Crypto</h3>
      <p className="text-sm text-gray-500 mb-4">Scan QR code or copy your wallet address</p>
      <div className="p-4 bg-gray-50 rounded-xl">
        <p className="text-xs text-gray-500 mb-2">Your Wallet Address</p>
        <p className="text-sm font-mono text-gray-900 break-all">0x742d...f39Fd6e51aad88</p>
      </div>
    </div>
  );
}

function SwapWidget() {
  return (
    <div className="p-5">
      <div className="space-y-3">
        <div className="bg-gray-50 rounded-2xl p-4">
          <p className="text-xs text-gray-500 mb-2">You pay</p>
          <div className="flex items-center justify-between">
            <input
              type="text"
              placeholder="0"
              className="text-2xl font-semibold text-gray-900 bg-transparent outline-none w-1/2"
            />
            <button className="flex items-center gap-2 px-3 py-2 bg-white rounded-xl shadow-sm">
              <div className="w-6 h-6 rounded-full bg-[#627EEA] flex items-center justify-center text-white text-xs">Ξ</div>
              <span className="text-sm font-medium">ETH</span>
            </button>
          </div>
        </div>
        
        <div className="flex justify-center">
          <button className="w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors">
            <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
            </svg>
          </button>
        </div>

        <div className="bg-gray-50 rounded-2xl p-4">
          <p className="text-xs text-gray-500 mb-2">You receive</p>
          <div className="flex items-center justify-between">
            <input
              type="text"
              placeholder="0"
              className="text-2xl font-semibold text-gray-900 bg-transparent outline-none w-1/2"
            />
            <button className="flex items-center gap-2 px-3 py-2 bg-white rounded-xl shadow-sm">
              <div className="w-6 h-6 rounded-full bg-[#F7931A] flex items-center justify-center text-white text-xs">₿</div>
              <span className="text-sm font-medium">BTC</span>
            </button>
          </div>
        </div>
      </div>

      <button className="w-full mt-6 py-4 bg-gradient-to-r from-orange-400 to-orange-500 text-white font-medium rounded-2xl hover:opacity-90 transition-opacity">
        Swap
      </button>
    </div>
  );
}

function TransactionsWidget() {
  const transactions = [
    { id: 1, type: 'Received', amount: '+0.5 ETH', usd: '$1,250.00', time: '2 hours ago', icon: '↙️' },
    { id: 2, type: 'Sent', amount: '-0.1 BTC', usd: '$4,320.00', time: '5 hours ago', icon: '↗️' },
    { id: 3, type: 'Swapped', amount: '500 USDC → 0.2 ETH', usd: '$500.00', time: '1 day ago', icon: '🔄' },
    { id: 4, type: 'Received', amount: '+100 SOL', usd: '$2,150.00', time: '2 days ago', icon: '↙️' },
  ];

  return (
    <div className="p-5">
      <div className="space-y-3">
        {transactions.map((tx) => (
          <div key={tx.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-lg">
              {tx.icon}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">{tx.type}</p>
              <p className="text-xs text-gray-500">{tx.time}</p>
            </div>
            <div className="text-right">
              <p className={`text-sm font-medium ${tx.amount.startsWith('+') ? 'text-green-500' : 'text-gray-900'}`}>
                {tx.amount}
              </p>
              <p className="text-xs text-gray-500">{tx.usd}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function NFTsWidget() {
  const nfts = [
    { id: 1, name: 'Bored Ape #1234', collection: 'BAYC', image: '🦧' },
    { id: 2, name: 'Punk #5678', collection: 'CryptoPunks', image: '👾' },
    { id: 3, name: 'Doodle #9012', collection: 'Doodles', image: '🎨' },
    { id: 4, name: 'Azuki #3456', collection: 'Azuki', image: '🍣' },
  ];

  return (
    <div className="p-5">
      <div className="grid grid-cols-2 gap-3">
        {nfts.map((nft) => (
          <div key={nft.id} className="bg-gray-50 rounded-2xl p-3 hover:bg-gray-100 transition-colors cursor-pointer">
            <div className="aspect-square rounded-xl bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-4xl mb-2">
              {nft.image}
            </div>
            <p className="text-sm font-medium text-gray-900 truncate">{nft.name}</p>
            <p className="text-xs text-gray-500">{nft.collection}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  const [hasEntered, setHasEntered] = useState(false);
  const windows = useWindowStore((state) => state.windows);

  const handleEnter = () => {
    setHasEntered(true);
  };

  const handleLogout = () => {
    setHasEntered(false);
  };

  return (
    <>
      {/* Entry Page */}
      <AnimatePresence>
        {!hasEntered && (
          <EntryPage onEnter={handleEnter} />
        )}
      </AnimatePresence>

      {/* Dawn OS Desktop - renders behind entry page, becomes visible after transition */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ 
          opacity: hasEntered ? 1 : 0,
          scale: hasEntered ? 1 : 0.95,
        }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <Desktop onLogout={handleLogout}>
          <AnimatePresence mode="popLayout">
            {windows.wallet.isOpen && !windows.wallet.isMinimized && (
              <Window key="window-wallet" id="wallet">
                <WalletOverview />
              </Window>
            )}

            {windows.send.isOpen && !windows.send.isMinimized && (
              <Window key="window-send" id="send">
                <SendCrypto />
              </Window>
            )}

            {windows.receive.isOpen && !windows.receive.isMinimized && (
              <Window key="window-receive" id="receive">
                <ReceiveWidget />
              </Window>
            )}

            {windows.swap.isOpen && !windows.swap.isMinimized && (
              <Window key="window-swap" id="swap">
                <SwapWidget />
              </Window>
            )}

            {windows.transactions.isOpen && !windows.transactions.isMinimized && (
              <Window key="window-transactions" id="transactions">
                <TransactionsWidget />
              </Window>
            )}

            {windows.nfts.isOpen && !windows.nfts.isMinimized && (
              <Window key="window-nfts" id="nfts">
                <NFTsWidget />
              </Window>
            )}
          </AnimatePresence>
        </Desktop>
      </motion.div>
    </>
  );
}
