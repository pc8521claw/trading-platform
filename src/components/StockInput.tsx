"use client";

import { useState } from 'react';

interface StockInputProps {
  onSelect: (symbol: string) => void;
  selectedSymbol: string;
}

export default function StockInput({ onSelect, selectedSymbol }: StockInputProps) {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onSelect(input.trim().toUpperCase());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        輸入股票代碼
      </label>
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value.toUpperCase())}
          placeholder="例如: AAPL, 0700.HK"
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          查詢
        </button>
      </div>
      <p className="mt-2 text-xs text-gray-500">
        範例：美股 AAPL、港股 0700.HK、中國A股 600519.SS
      </p>
    </form>
  );
}
