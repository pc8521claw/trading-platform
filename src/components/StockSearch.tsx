"use client";

import { useState, useEffect, useRef } from 'react';

interface SearchResult {
  symbol: string;
  name: string;
  nameZh: string;
}

interface StockSearchProps {
  onSelect: (symbol: string) => void;
  selectedSymbol: string;
}

export default function StockSearch({ onSelect, selectedSymbol }: StockSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch results when query changes
  useEffect(() => {
    const fetchResults = async () => {
      if (query.length < 1) {
        // Show popular stocks when no query
        setLoading(true);
        try {
          const res = await fetch(`/api/stock/search?q=`);
          if (res.ok) {
            const data = await res.json();
            setResults(data);
          }
        } catch (e) {
          console.error(e);
        }
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const res = await fetch(`/api/stock/search?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data);
        }
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    };

    const debounce = setTimeout(fetchResults, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        !inputRef.current?.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (stock: SearchResult) => {
    onSelect(stock.symbol);
    setQuery('');
    setShowDropdown(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      // If it's already a valid symbol format, use it directly
      onSelect(query.trim().toUpperCase());
      setShowDropdown(false);
    }
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        搜尋港股
      </label>
      <form onSubmit={handleSubmit} className="relative">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setShowDropdown(true);
              }}
              onFocus={() => setShowDropdown(true)}
              placeholder="輸入股票代碼或公司名稱..."
              className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              autoComplete="off"
            />
            {loading && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              </span>
            )}
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            查詢
          </button>
        </div>

        {/* Dropdown */}
        {showDropdown && results.length > 0 && (
          <div
            ref={dropdownRef}
            className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-y-auto"
          >
            {results.map((stock) => (
              <button
                key={stock.symbol}
                type="button"
                onClick={() => handleSelect(stock)}
                className="w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors flex items-center justify-between border-b border-gray-100 last:border-b-0"
              >
                <div>
                  <span className="font-medium text-gray-900">{stock.nameZh || stock.name}</span>
                  <span className="ml-2 text-sm text-gray-500">{stock.symbol}</span>
                </div>
                <span className="text-xs text-gray-400">
                  {stock.symbol.endsWith('.HK') ? '🇭🇰 港股' : '📈'}
                </span>
              </button>
            ))}
          </div>
        )}
      </form>
      
      {/* Quick buttons for popular stocks */}
      <div className="mt-3">
        <p className="text-xs text-gray-500 mb-2">熱門股票：</p>
        <div className="flex flex-wrap gap-2">
          {[
            { symbol: '0700.HK', name: '騰訊' },
            { symbol: '0005.HK', name: '匯豐' },
            { symbol: '9988.HK', name: '阿里' },
            { symbol: '1810.HK', name: '小米' },
            { symbol: '1211.HK', name: '比亞迪' },
            { symbol: '1299.HK', name: '友邦' },
            { symbol: '2318.HK', name: '平安' },
            { symbol: '1398.HK', name: '工行' },
          ].map((stock) => (
            <button
              key={stock.symbol}
              onClick={() => onSelect(stock.symbol)}
              className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                selectedSymbol === stock.symbol
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:text-blue-600'
              }`}
            >
              {stock.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}