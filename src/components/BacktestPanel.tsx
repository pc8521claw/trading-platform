"use client";

import { useState, useEffect } from 'react';
import { StockQuote, BacktestResult } from '@/types/stock';
import { STRATEGIES, runBacktest, StrategyType } from '@/lib/indicators';

interface BacktestPanelProps {
  quotes: StockQuote[];
  symbol: string;
}

export default function BacktestPanel({ quotes, symbol }: BacktestPanelProps) {
  const [selectedStrategy, setSelectedStrategy] = useState<StrategyType>('ma_cross');
  
  // Individual param states
  const [shortMA, setShortMA] = useState(20);
  const [longMA, setLongMA] = useState(50);
  const [rsiPeriod, setRsiPeriod] = useState(14);
  const [oversold, setOversold] = useState(30);
  const [overbought, setOverbought] = useState(70);
  const [bbPeriod, setBbPeriod] = useState(20);
  const [bbStd, setBbStd] = useState(2);
  const [momentumPeriod, setMomentumPeriod] = useState(10);
  
  const [result, setResult] = useState<BacktestResult | null>(null);
  const [loading, setLoading] = useState(false);

  // Get current strategy config
  const currentStrategy = STRATEGIES.find(s => s.id === selectedStrategy)!;

  const handleBacktest = () => {
    if (quotes.length < 200) {
      alert('需要更多歷史數據進行回測（至少200天）');
      return;
    }
    
    const params = { shortMA, longMA, rsiPeriod, oversold, overbought, bbPeriod, bbStd, momentumPeriod };
    setLoading(true);
    
    setTimeout(() => {
      const backtestResult = runBacktest(quotes, selectedStrategy, params, 10000);
      setResult(backtestResult);
      setLoading(false);
    }, 500);
  };

  // Handler for any param change
  const handleParamChange = (key: string, value: number) => {
    switch (key) {
      case 'shortMA': setShortMA(value); break;
      case 'longMA': setLongMA(value); break;
      case 'rsiPeriod': setRsiPeriod(value); break;
      case 'oversold': setOversold(value); break;
      case 'overbought': setOverbought(value); break;
      case 'bbPeriod': setBbPeriod(value); break;
      case 'bbStd': setBbStd(value); break;
      case 'momentumPeriod': setMomentumPeriod(value); break;
    }
  };

  // Get current value for a param
  const getParamValue = (key: string): number => {
    switch (key) {
      case 'shortMA': return shortMA;
      case 'longMA': return longMA;
      case 'rsiPeriod': return rsiPeriod;
      case 'oversold': return oversold;
      case 'overbought': return overbought;
      case 'bbPeriod': return bbPeriod;
      case 'bbStd': return bbStd;
      case 'momentumPeriod': return momentumPeriod;
      default: return 0;
    }
  };

  if (!symbol) {
    return (
      <div className="bg-white rounded-lg p-6 shadow text-center text-gray-500">
        請先選擇股票
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-6 shadow">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 策略回測</h3>
      
      {/* Strategy Selector */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          選擇策略
        </label>
        <div className="grid grid-cols-1 gap-2">
          {STRATEGIES.map((strategy) => (
            <button
              key={strategy.id}
              onClick={() => setSelectedStrategy(strategy.id)}
              className={`p-3 rounded-lg text-left text-sm transition ${
                selectedStrategy === strategy.id
                  ? 'bg-blue-100 border-2 border-blue-500 text-blue-700'
                  : 'bg-gray-50 border-2 border-transparent hover:border-gray-200'
              }`}
            >
              <div className="font-medium">{strategy.name}</div>
              <div className="text-xs text-gray-500">{strategy.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Strategy Parameters */}
      {currentStrategy.params && currentStrategy.params.length > 0 && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm font-medium text-gray-700 mb-2">策略參數</p>
          <div className="space-y-3">
            {currentStrategy.params.map((param) => (
              <div key={param.key}>
                <label className="block text-xs text-gray-600 mb-1">
                  {param.name}: <span className="font-bold text-blue-600">{getParamValue(param.key)}</span>
                </label>
                <input
                  type="range"
                  min={param.min}
                  max={param.max}
                  step={param.step}
                  value={getParamValue(param.key)}
                  onChange={(e) => handleParamChange(param.key, Number(e.target.value))}
                  className="w-full"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Backtest Button */}
      <button
        onClick={handleBacktest}
        disabled={loading || quotes.length < 200}
        className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
      >
        {loading ? '計算中...' : '執行回測'}
      </button>

      {/* Results */}
      {result && (
        <div className="mt-6 space-y-4">
          <div className="text-center">
            <p className="text-sm text-gray-500">{result.strategy}</p>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <p className="text-xs text-gray-500 uppercase">最終價值</p>
              <p className="text-xl font-bold text-blue-600">${result.finalValue.toFixed(2)}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <p className="text-xs text-gray-500 uppercase">報酬率</p>
              <p className={`text-xl font-bold ${result.returnPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {result.returnPercent >= 0 ? '+' : ''}{result.returnPercent.toFixed(2)}%
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <p className="text-xs text-gray-500 uppercase">夏普比率</p>
              <p className="text-xl font-bold text-purple-600">{result.sharpeRatio.toFixed(2)}</p>
            </div>
          </div>

          {result.trades.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">
                交易記錄 ({result.trades.length} 筆)
              </p>
              <div className="max-h-40 overflow-auto border border-gray-200 rounded-lg">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-2 py-1 text-left text-xs">日期</th>
                      <th className="px-2 py-1 text-left text-xs">類型</th>
                      <th className="px-2 py-1 text-right text-xs">價格</th>
                      <th className="px-2 py-1 text-right text-xs">股數</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.trades.slice(0, 20).map((trade, i) => (
                      <tr key={i} className="border-t border-gray-100">
                        <td className="px-2 py-1 text-xs">{trade.date}</td>
                        <td className="px-2 py-1">
                          <span className={`text-xs px-1 py-0.5 rounded ${
                            trade.type === 'BUY' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {trade.type}
                          </span>
                        </td>
                        <td className="px-2 py-1 text-right text-xs">${trade.price.toFixed(2)}</td>
                        <td className="px-2 py-1 text-right text-xs">{trade.shares}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {result.trades.length > 20 && (
                <p className="text-xs text-gray-500 mt-1 text-center">
                  ...還有 {result.trades.length - 20} 筆交易
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
