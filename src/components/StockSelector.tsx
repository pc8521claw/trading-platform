"use client";

import { useState, useEffect } from 'react';
import { searchStocks, POPULAR_STOCKS } from '@/lib/stock-api';
import { StockInfo } from '@/types/stock';

interface StockSelectorProps {
  onSelect: (symbol: string) => void;
  selectedSymbol: string;
}

export default function StockSelector({ onSelect, selectedSymbol }: StockSelectorProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Array<{symbol: string, name: string}>>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const searchTimeout = setTimeout(async () => {
      if (query.length > 0) {
        const stocks = await searchStocks(query);
        setResults(stocks);
        setShowDropdown(true);
      } else {
        setResults(POPULAR_STOCKS);
        setShowDropdown(false);
      }
    }, 300);

    return () => clearTimeout(searchTimeout);
  }, [query]);

  const handleSelect = (symbol: string) => {
    onSelect(symbol);
    setQuery('');
    setShowDropdown(false);
  };

  const displayStock = [...POPULAR_STOCKS, ...results].find(s => s.symbol === selectedSymbol);

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-1">選擇股票</label>
      <input
        type="text"
        value={query || (displayStock ? `${displayStock.symbol} - ${displayStock.name}` : '')}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => {
          setResults(POPULAR_STOCKS);
          setShowDropdown(true);
        }}
        onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
        placeholder="輸入股票代碼或名稱..."
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
      
      {showDropdown && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
          {(query ? results : POPULAR_STOCKS).length === 0 ? (
            <div className="px-4 py-2 text-gray-500">找不到股票</div>
          ) : (
            (query ? results : POPULAR_STOCKS).map((stock) => (
              <button
                key={stock.symbol}
                onClick={() => handleSelect(stock.symbol)}
                className={`w-full px-4 py-2 text-left hover:bg-blue-50 ${
                  stock.symbol === selectedSymbol ? 'bg-blue-100' : ''
                }`}
              >
                <span className="font-medium">{stock.symbol}</span>
                <span className="text-gray-500 ml-2">{stock.name}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
