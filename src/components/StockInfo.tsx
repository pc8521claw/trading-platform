"use client";

import { StockInfo } from '@/types/stock';

interface StockInfoProps {
  info: StockInfo | null;
  loading: boolean;
  symbol?: string;
}

export default function StockInfoPanel({ info, loading, symbol = '' }: StockInfoProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-lg p-6 shadow">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
        </div>
      </div>
    );
  }

  if (!info) {
    return (
      <div className="bg-white rounded-lg p-6 shadow text-center text-gray-500">
        選擇股票以查看資訊
      </div>
    );
  }

  // Determine currency based on symbol
  const isHK = symbol.endsWith('.HK') || /\d{4}\.HK$/i.test(symbol);
  const currency = isHK ? 'HK$' : '$';
  const volUnit = isHK ? '股' : '';
  const mktCapUnit = isHK ? 'HK$' : '$';

  const formatNumber = (num: number) => {
    if (num >= 1e12) return `${(num / 1e12).toFixed(2)}T`;
    if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
    return num.toLocaleString();
  };

  const fmt = (val: number | undefined | null) => {
    if (val === null || val === undefined || val === 0) return 'N/A';
    return val.toFixed(2);
  };

  const fmtPct = (val: number | undefined | null) => {
    if (val === null || val === undefined || val === 0) return 'N/A';
    return `${(val >= 0 ? '+' : '')}${(val * 100).toFixed(2)}%`;
  };

  const fmtDiv = (val: number | undefined | null) => {
    if (val === null || val === undefined || val === 0) return 'N/A';
    return `${val.toFixed(2)}%`;
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{info.symbol}</h2>
          <p className="text-gray-500 text-sm">{info.name}</p>
          {info.sector && (
            <p className="text-gray-400 text-xs">{info.sector}</p>
          )}
        </div>
        <div className={`text-right ${info.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          <div className="text-3xl font-bold"><span className="text-sm font-normal text-gray-400">{currency}</span>{info.price.toFixed(2)}</div>
          <div className="text-sm">
            {info.change >= 0 ? '+' : ''}{info.change.toFixed(2)} ({info.changePercent.toFixed(2)}%)
          </div>
        </div>
      </div>

      {/* Basic Info */}
      <div className="grid grid-cols-2 gap-4 mt-4">
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-gray-500 text-xs uppercase">成交量</p>
          <p className="text-lg font-semibold">
            {formatNumber(info.volume)}
            <span className="text-xs text-gray-400 ml-1">{volUnit}</span>
          </p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-gray-500 text-xs uppercase">市值</p>
          <p className="text-lg font-semibold">
            <span className="text-xs font-normal text-gray-400">{mktCapUnit}</span>{formatNumber(info.marketCap || 0)}
          </p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-gray-500 text-xs uppercase">52週最高</p>
          <p className="text-lg font-semibold"><span className="text-xs font-normal text-gray-400">{currency}</span>{info.high52Week.toFixed(2)}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-gray-500 text-xs uppercase">52週最低</p>
          <p className="text-lg font-semibold"><span className="text-xs font-normal text-gray-400">{currency}</span>{info.low52Week.toFixed(2)}</p>
        </div>
      </div>

      {/* Fundamental Data */}
      <div className="mt-6">
        <h3 className="text-sm font-semibold text-gray-700 uppercase mb-3">基本面數據</h3>
        <div className="grid grid-cols-3 gap-3">
          {/* P/E Ratios */}
          <div className="bg-blue-50 rounded-lg p-3">
            <p className="text-blue-500 text-xs uppercase">P/E (歷史)</p>
            <p className="text-xl font-bold">{fmt(info.trailingPE)}</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-3">
            <p className="text-blue-500 text-xs uppercase">P/E (預測)</p>
            <p className="text-xl font-bold">{fmt(info.forwardPE)}</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-3">
            <p className="text-blue-500 text-xs uppercase">帳面價值</p>
            <p className="text-xl font-bold"><span className="text-sm font-normal text-gray-400">{currency}</span>{fmt(info.bookValue)}</p>
          </div>

          {/* EPS */}
          <div className="bg-green-50 rounded-lg p-3">
            <p className="text-green-500 text-xs uppercase">EPS (歷史)</p>
            <p className="text-xl font-bold"><span className="text-sm font-normal text-gray-400">{currency}</span>{fmt(info.epsTrailingTwelveMonths)}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-3">
            <p className="text-green-500 text-xs uppercase">EPS (預測)</p>
            <p className="text-xl font-bold"><span className="text-sm font-normal text-gray-400">{currency}</span>{fmt(info.epsForward)}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-3">
            <p className="text-green-500 text-xs uppercase">P/B</p>
            <p className="text-xl font-bold">{fmt(info.priceToBook)}</p>
          </div>

          {/* Growth */}
          <div className="bg-purple-50 rounded-lg p-3">
            <p className="text-purple-500 text-xs uppercase">盈利增長</p>
            <p className={`text-xl font-bold ${(info.earningsGrowth || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {fmtPct(info.earningsGrowth)}
            </p>
          </div>
          <div className="bg-purple-50 rounded-lg p-3">
            <p className="text-purple-500 text-xs uppercase">營收增長</p>
            <p className={`text-xl font-bold ${(info.revenueGrowth || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {fmtPct(info.revenueGrowth)}
            </p>
          </div>
          <div className="bg-purple-50 rounded-lg p-3">
            <p className="text-purple-500 text-xs uppercase">股息率</p>
            <p className="text-xl font-bold">{fmtDiv(info.dividendYield)}</p>
          </div>

          {/* Profitability */}
          <div className="bg-orange-50 rounded-lg p-3 col-span-3">
            <p className="text-orange-500 text-xs uppercase">利潤率</p>
            <div className="mt-1 h-2 bg-orange-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-orange-500 rounded-full"
                style={{ width: info.profitMargins ? `${Math.min(info.profitMargins * 100, 100)}%` : '0%' }}
              />
            </div>
            <p className="text-lg font-bold mt-1">
              {info.profitMargins ? `${(info.profitMargins * 100).toFixed(2)}%` : 'N/A'}
            </p>
          </div>
        </div>
      </div>

      {/* Business Summary */}
      {info.longBusinessSummary && (
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-gray-700 uppercase mb-2">公司簡介</h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            {info.longBusinessSummary}
          </p>
        </div>
      )}
    </div>
  );
}