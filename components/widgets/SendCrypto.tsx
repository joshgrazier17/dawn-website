'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

interface Contact {
  id: string;
  name: string;
  address: string;
  avatar: string;
}

const recentContacts: Contact[] = [
  {
    id: '1',
    name: '0xSeed',
    address: 'Glpj...NBtH',
    avatar: '🧑‍💻',
  },
  {
    id: '2',
    name: 'vitalik.eth',
    address: '0xd8...3b48',
    avatar: '👨‍🚀',
  },
];

const tokens = [
  { id: 'btc', name: 'Bitcoin', symbol: 'BTC', icon: '₿', color: '#F7931A' },
  { id: 'eth', name: 'Ethereum', symbol: 'ETH', icon: 'Ξ', color: '#627EEA' },
  { id: 'sol', name: 'Solana', symbol: 'SOL', icon: '◎', color: '#9945FF' },
];

export default function SendCrypto() {
  const [selectedToken, setSelectedToken] = useState(tokens[0]);
  const [address, setAddress] = useState('');
  const [showTokenDropdown, setShowTokenDropdown] = useState(false);

  return (
    <div className="p-5">
      {/* Token selector */}
      <div className="relative mb-5">
        <motion.button
          onClick={() => setShowTokenDropdown(!showTokenDropdown)}
          className="w-full flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
              style={{ backgroundColor: selectedToken.color }}
            >
              {selectedToken.icon}
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-gray-900">{selectedToken.name}</p>
              <p className="text-xs text-gray-500">{selectedToken.symbol}</p>
            </div>
          </div>
          <svg
            className={`w-5 h-5 text-gray-400 transition-transform ${showTokenDropdown ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </motion.button>

        {/* Dropdown */}
        {showTokenDropdown && (
          <motion.div
            className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg overflow-hidden z-10"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {tokens.map((token) => (
              <button
                key={token.id}
                onClick={() => {
                  setSelectedToken(token);
                  setShowTokenDropdown(false);
                }}
                className={`w-full flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors ${
                  selectedToken.id === token.id ? 'bg-gray-50' : ''
                }`}
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
                  style={{ backgroundColor: token.color }}
                >
                  {token.icon}
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-900">{token.name}</p>
                  <p className="text-xs text-gray-500">{token.symbol}</p>
                </div>
              </button>
            ))}
          </motion.div>
        )}
      </div>

      {/* Address input */}
      <motion.div
        className="bg-gray-50 rounded-2xl p-4 mb-5"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">To</span>
          <input
            type="text"
            placeholder="Enter address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="flex-1 bg-transparent text-sm text-gray-900 placeholder-gray-400 outline-none"
          />
          <motion.button
            className="px-3 py-1.5 bg-gray-900 text-white text-xs font-medium rounded-lg hover:bg-gray-800 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Paste
          </motion.button>
          <motion.button
            className="w-8 h-8 rounded-lg bg-white flex items-center justify-center hover:bg-gray-100 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </motion.button>
        </div>
      </motion.div>

      {/* Recent contacts */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center gap-2 mb-3">
          <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span className="text-sm text-gray-500">Recently used</span>
        </div>

        <div className="space-y-2">
          {recentContacts.map((contact, index) => (
            <motion.button
              key={contact.id}
              onClick={() => setAddress(contact.address)}
              className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + index * 0.05 }}
              whileHover={{ x: 4 }}
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-lg">
                {contact.avatar}
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900">{contact.name}</p>
                <p className="text-xs text-gray-500">{contact.address}</p>
              </div>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Amount section (hidden by default, could be expanded) */}
      <motion.div
        className="mt-6 pt-5 border-t border-gray-100"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <div className="text-center">
          <input
            type="text"
            placeholder="0"
            className="w-full text-center text-4xl font-semibold text-gray-900 bg-transparent outline-none placeholder-gray-300"
          />
          <p className="text-sm text-gray-500 mt-2">≈ $0.00 USD</p>
        </div>

        <motion.button
          className="w-full mt-6 py-4 bg-gray-900 text-white font-medium rounded-2xl hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!address}
          whileHover={{ scale: address ? 1.02 : 1 }}
          whileTap={{ scale: address ? 0.98 : 1 }}
        >
          Continue
        </motion.button>
      </motion.div>
    </div>
  );
}

