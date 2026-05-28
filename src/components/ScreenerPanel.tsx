"use client";

import { useState } from 'react';
import { StockQuote } from '@/types/stock';

interface ScreenerFilters {
  marketCap: 'all' | 'large' | 'medium' | 'small';
  priceMin: string;
  priceMax: string;
  volumeMin: string;
  sector: string;
}

interface ScreenerResult {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: string;
  sector: string;
}

// Sample stock list for screening (would normally come from an API)
const SAMPLE_STOCKS: ScreenerResult[] = [
  { symbol: '0700.HK', name: '騰訊控股', price: 378.2, change: 5.2, changePercent: 1.39, volume: 4500000, marketCap: 'large', sector: '科技' },
  { symbol: '0005.HK', name: '匯豐控股', price: 67.85, change: -0.35, changePercent: -0.51, volume: 2200000, marketCap: 'large', sector: '金融' },
  { symbol: '9988.HK', name: '阿里巴巴-SW', price: 87.45, change: 2.15, changePercent: 2.52, volume: 5800000, marketCap: 'large', sector: '電商' },
  { symbol: '1810.HK', name: '小米集團-W', price: 12.85, change: -0.25, changePercent: -1.91, volume: 8900000, marketCap: 'large', sector: '科技' },
  { symbol: '1211.HK', name: '比亞迪股份', price: 198.5, change: 3.8, changePercent: 1.95, volume: 3200000, marketCap: 'large', sector: '汽車' },
  { symbol: '2318.HK', name: '中國平安', price: 48.75, change: 0.65, changePercent: 1.35, volume: 4100000, marketCap: 'large', sector: '保險' },
  { symbol: '1299.HK', name: '友邦保險', price: 72.3, change: -0.8, changePercent: -1.09, volume: 1800000, marketCap: 'large', sector: '保險' },
  { symbol: '3690.HK', name: '美團-W', price: 125.6, change: 4.2, changePercent: 3.46, volume: 6200000, marketCap: 'large', sector: '電商' },
  { symbol: '0941.HK', name: '中國移動', price: 68.9, change: 0.45, changePercent: 0.66, volume: 1500000, marketCap: 'large', sector: '電信' },
  { symbol: '9618.HK', name: '京東集團-SW', price: 132.4, change: -2.3, changePercent: -1.71, volume: 2800000, marketCap: 'large', sector: '電商' },
  { symbol: '1398.HK', name: '工商銀行', price: 4.82, change: 0.02, changePercent: 0.42, volume: 9500000, marketCap: 'large', sector: '金融' },
  { symbol: '3969.HK', name: '銀河娛樂', price: 42.15, change: 1.25, changePercent: 3.06, volume: 1900000, marketCap: 'medium', sector: '博彩' },
  { symbol: '1109.HK', name: '中國光大控股', price: 8.65, change: -0.15, changePercent: -1.70, volume: 650000, marketCap: 'medium', sector: '金融' },
  { symbol: '2333.HK', name: '長城汽車', price: 25.8, change: 0.95, changePercent: 3.82, volume: 2100000, marketCap: 'medium', sector: '汽車' },
  { symbol: '2319.HK', name: '蒙牛乳業', price: 31.2, change: -0.3, changePercent: -0.95, volume: 980000, marketCap: 'medium', sector: '消費' },
  { symbol: '2020.HK', name: '安踏體育用品', price: 78.5, change: 1.8, changePercent: 2.35, volume: 1200000, marketCap: 'medium', sector: '消費' },
  { symbol: '0175.HK', name: '吉利汽車', price: 16.85, change: 0.45, changePercent: 2.74, volume: 3500000, marketCap: 'medium', sector: '汽車' },
  { symbol: '0669.HK', name: '創科實業', price: 98.7, change: -1.2, changePercent: -1.20, volume: 720000, marketCap: 'medium', sector: '工業' },
  { symbol: '0012.HK', name: '恒基地產', price: 32.4, change: 0.15, changePercent: 0.47, volume: 850000, marketCap: 'medium', sector: '地產' },
  { symbol: '0016.HK', name: '新鴻基地產', price: 108.5, change: 0.85, changePercent: 0.79, volume: 1100000, marketCap: 'medium', sector: '地產' },
];

const SECTORS = ['全部', '科技', '金融', '電商', '汽車', '保險', '電信', '博彩', '消費', '地產', '工業'];

export default function ScreenerPanel() {
  const [filters, setFilters] = useState<ScreenerFilters>({
    marketCap: 'all',
    priceMin: '',
    priceMax: '',
    volumeMin: '',
    sector: '',
  });
  
  const [results, setResults] = useState<ScreenerResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleFilterChange = (key: keyof ScreenerFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleScreener = () => {
    setLoading(true);
    setHasSearched(true);
    
    // Simulate API delay
    setTimeout(() => {
      let filtered = [...SAMPLE_STOCKS];
      
      // Market Cap filter
      if (filters.marketCap !== 'all') {
        filtered = filtered.filter(s => s.marketCap === filters.marketCap);
      }
      
      // Price range filter
      if (filters.priceMin) {
        filtered = filtered.filter(s => s.price >= parseFloat(filters.priceMin));
      }
      if (filters.priceMax) {
        filtered = filtered.filter(s => s.price <= parseFloat(filters.priceMax));
      }
      
      // Volume filter
      if (filters.volumeMin) {
        filtered = filtered.filter(s => s.volume >= parseInt(filters.volumeMin) * 1000000);
      }
      
      // Sector filter
      if (filters.sector && filters.sector !== '全部') {
        filtered = filtered.filter(s => s.sector === filters.sector);
      }
      
      setResults(filtered);
      setLoading(false);
    }, 500);
  };

  const resetFilters = () => {
    setFilters({
      marketCap: 'all',
      priceMin: '',
      priceMax: '',
      volumeMin: '',
      sector: '',
    });
    setResults([]);
    setHasSearched(false);
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">🔍 股票篩選器</h3>
      <p className="text-xs text-orange-500 font-medium mb-4">⚠️ 開發中 - 目前為示範數據</p>
      
      {/* Filters */}
      <div className="space-y-4 mb-6">
        {/* Market Cap */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">市值</label>
          <select
            value={filters.marketCap}
            onChange={(e) => handleFilterChange('marketCap', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">全部</option>
            <option value="large">大型 (&gt;=$10B)</option>
            <option value="medium">中型 ($2B-$10B)</option>
            <option value="small">小型 (&lt;$2B)</option>
          </select>
        </div>

        {/* Price Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">股價範圍 (HK$)</label>
          <div className="flex gap-2 items-center">
            <input
              type="number"
              value={filters.priceMin}
              onChange={(e) => handleFilterChange('priceMin', e.target.value)}
              placeholder="最低"
              className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-gray-400">-</span>
            <input
              type="number"
              value={filters.priceMax}
              onChange={(e) => handleFilterChange('priceMax', e.target.value)}
              placeholder="最高"
              className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Volume */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">成交量 (最少)</label>
          <input
            type="number"
            value={filters.volumeMin}
            onChange={(e) => handleFilterChange('volumeMin', e.target.value)}
            placeholder="例如: 1000000"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Sector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">行業板塊</label>
          <select
            value={filters.sector}
            onChange={(e) => handleFilterChange('sector', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            {SECTORS.map(s => (
              <option key={s} value={s === '全部' ? '' : s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={handleScreener}
          className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
        >
          搜尋
        </button>
        <button
          onClick={resetFilters}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
        >
          重置
        </button>
      </div>

      {/* Results */}
      {loading && (
        <div className="text-center py-4">
          <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
          <p className="text-sm text-gray-500 mt-2">搜尋中...</p>
        </div>
      )}

      {hasSearched && !loading && (
        <div className="mt-4">
          <div className="flex justify-between items-center mb-3">
            <p className="text-sm font-medium text-gray-700">
              找到 <span className="text-blue-600">{results.length}</span> 檔股票
            </p>
          </div>
          
          {results.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              <p className="text-sm">沒有找到符合條件的股票</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {results.map((stock) => (
                <div
                  key={stock.symbol}
                  className="p-3 bg-gray-50 rounded-lg hover:bg-blue-50 transition cursor-pointer"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-900">{stock.name}</p>
                      <p className="text-xs text-gray-500">{stock.symbol}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">HK${stock.price.toFixed(2)}</p>
                      <p className={`text-xs ${stock.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)} ({stock.changePercent.toFixed(2)}%)
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4 mt-2 text-xs text-gray-500">
                    <span>成交量: {(stock.volume / 1000000).toFixed(1)}M</span>
                    <span>板塊: {stock.sector}</span>
                    <span>市值: {stock.marketCap}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {!hasSearched && !loading && (
        <div className="text-center py-6 text-gray-400">
          <p className="text-sm">選擇篩選條件然後點擊搜尋</p>
        </div>
      )}
    </div>
  );
}