"use client";

import { useState, useEffect } from 'react';
import StockSearch from '@/components/StockSearch';
import StockChart from '@/components/StockChart';
import StockInfoPanel from '@/components/StockInfo';
import BacktestPanel from '@/components/BacktestPanel';
import PredictionPanel from '@/components/PredictionPanel';
import ScreenerPanel from '@/components/ScreenerPanel';
import { getStockQuote, getStockHistory } from '@/lib/stock-api';
import { StockQuote, StockInfo } from '@/types/stock';

export default function TradingPlatform() {
  const [symbol, setSymbol] = useState('AAPL');
  const [stockInfo, setStockInfo] = useState<StockInfo | null>(null);
  const [quotes, setQuotes] = useState<StockQuote[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      const [info, history] = await Promise.all([
        getStockQuote(symbol),
        getStockHistory(symbol, '1d', '1y'),
      ]);
      
      setStockInfo(info);
      setQuotes(history);
      setLoading(false);
    };

    fetchData();
  }, [symbol]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">📈 股票分析平台</h1>
              <p className="text-sm text-gray-500">即時市場數據、技術分析、策略回測、價格預測</p>
            </div>
            <StockSearch 
              selectedSymbol={symbol} 
              onSelect={setSymbol} 
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Stock Info & Chart */}
          <div className="lg:col-span-2 space-y-6">
            <StockInfoPanel info={stockInfo} loading={loading} symbol={symbol} />
            <StockChart quotes={quotes} />
          </div>

          {/* Right Column - Tools */}
          <div className="space-y-6">
            <BacktestPanel 
              quotes={quotes} 
              symbol={symbol} 
            />
            <PredictionPanel 
              quotes={quotes} 
              symbol={symbol}
              currentPrice={stockInfo?.price || 0}
            />
          </div>
        </div>

        {/* Screener Section */}
        <div className="mt-6">
          <ScreenerPanel />
        </div>

        {/* Disclaimer */}
        <div className="mt-8 p-4 bg-gray-100 rounded-lg text-center">
          <p className="text-sm text-gray-500">
            數據來源：Yahoo Finance | 數據截取日期：{new Date().toLocaleDateString('zh-TW')} | 
            股票價格及市場數據僅供參考，不構成投資建議
          </p>
        </div>

        {/* Footer */}
        <footer className="mt-8 text-center text-sm text-gray-400">
          <p>股票分析平台 v1.0 - 示範版本</p>
        </footer>
      </main>
    </div>
  );
}
