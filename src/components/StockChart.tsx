"use client";

import { useState } from 'react';
import { ComposedChart, BarChart, LineChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, Cell, ReferenceLine } from 'recharts';
import { StockQuote } from '@/types/stock';
import { calculateSMA, calculateBollingerBands, calculateRSI, calculateAllIndicators } from '@/lib/indicators';

interface StockChartProps {
  quotes: StockQuote[];
  showVolume?: boolean;
}

export default function StockChart({ quotes, showVolume = true }: StockChartProps) {
  const [showMA20, setShowMA20] = useState(true);
  const [showMA50, setShowMA50] = useState(false);
  const [showMA200, setShowMA200] = useState(false);
  const [showBollinger, setShowBollinger] = useState(false);
  const [showVolumeBars, setShowVolumeBars] = useState(true);
  const [showRSI, setShowRSI] = useState(false);

  if (quotes.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
        <span className="text-gray-500">載入中...</span>
      </div>
    );
  }

  // Calculate MA data
  const closes = quotes.map(q => q.close);

  const ma20Data = quotes.map((q, i) => {
    const startIdx = Math.max(0, i - 19);
    const slice = closes.slice(startIdx, i + 1);
    const ma = calculateSMA(slice, Math.min(slice.length, 20));
    return { date: q.date, ma20: ma };
  });

  const ma50Data = quotes.map((q, i) => {
    const startIdx = Math.max(0, i - 49);
    const slice = closes.slice(startIdx, i + 1);
    const ma = calculateSMA(slice, Math.min(slice.length, 50));
    return { date: q.date, ma50: ma };
  });

  const ma200Data = quotes.map((q, i) => {
    const startIdx = Math.max(0, i - 199);
    const slice = closes.slice(startIdx, i + 1);
    const ma = calculateSMA(slice, Math.min(slice.length, 200));
    return { date: q.date, ma200: ma };
  });

  // Calculate Bollinger Bands data
  const bbData = quotes.map((q, i) => {
    const startIdx = Math.max(0, i - 19);
    const slice = closes.slice(startIdx, i + 1);
    const bb = calculateBollingerBands(slice, Math.min(slice.length, 20), 2);
    return { date: q.date, bbUpper: bb?.upper, bbMiddle: bb?.middle, bbLower: bb?.lower };
  });

  // Calculate RSI data
  const rsiData = quotes.map((q, i) => {
    if (i < 14) return { date: q.date, rsi: null }; // Need at least 14 price changes (15 data points)
    const slice = closes.slice(i - 14, i + 1); // 15 prices for 14 periods of changes
    const rsi = calculateRSI(slice, 14);
    return { date: q.date, rsi };
  });

  // Current RSI for display
  const currentRSI = rsiData[rsiData.length - 1]?.rsi;

  // Combine all data - determine volume color (green if price up, red if price down)
  const data = quotes.map((q, i) => ({
    date: q.date,
    price: q.close,
    open: q.open,
    high: q.high,
    low: q.low,
    volume: q.volume,
    ma20: ma20Data[i]?.ma20 || null,
    ma50: ma50Data[i]?.ma50 || null,
    ma200: ma200Data[i]?.ma200 || null,
    bbUpper: bbData[i]?.bbUpper || null,
    bbMiddle: bbData[i]?.bbMiddle || null,
    bbLower: bbData[i]?.bbLower || null,
    rsi: rsiData[i]?.rsi || null,
    // Volume bar color - green if close >= open, red otherwise
    volumeColor: q.close >= (q.open || q.close) ? '#22C55E' : '#EF4444',
  }));

  const minPrice = Math.min(...data.map(d => d.low));
  const maxPrice = Math.max(...data.map(d => d.high));
  const priceDomain = [minPrice * 0.98, maxPrice * 1.02];

  return (
    <div className="bg-white rounded-lg p-4 shadow">
      {/* Indicator toggles */}
      <div className="mb-3 flex flex-wrap gap-2">
        <label className="text-xs font-medium text-gray-600 mr-2">技術指標：</label>
        <button
          onClick={() => setShowMA20(!showMA20)}
          className={`px-2 py-1 rounded text-xs font-medium transition ${
            showMA20 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'
          }`}
        >
          MA20
        </button>
        <button
          onClick={() => setShowMA50(!showMA50)}
          className={`px-2 py-1 rounded text-xs font-medium transition ${
            showMA50 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'
          }`}
        >
          MA50
        </button>
        <button
          onClick={() => setShowMA200(!showMA200)}
          className={`px-2 py-1 rounded text-xs font-medium transition ${
            showMA200 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'
          }`}
        >
          MA200
        </button>
        <button
          onClick={() => setShowBollinger(!showBollinger)}
          className={`px-2 py-1 rounded text-xs font-medium transition ${
            showBollinger ? 'bg-purple-500 text-white' : 'bg-gray-200 text-gray-600'
          }`}
        >
          布林帶
        </button>
        <button
          onClick={() => setShowVolumeBars(!showVolumeBars)}
          className={`px-2 py-1 rounded text-xs font-medium transition ${
            showVolumeBars ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'
          }`}
        >
          成交量
        </button>
        <button
          onClick={() => setShowRSI(!showRSI)}
          className={`px-2 py-1 rounded text-xs font-medium transition ${
            showRSI ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-600'
          }`}
        >
          RSI
        </button>
        {currentRSI !== null && currentRSI !== undefined && (
          <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
            currentRSI > 70 ? 'bg-red-100 text-red-700' : currentRSI < 30 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
          }`}>
            RSI: {currentRSI.toFixed(1)} {currentRSI > 70 ? '(超買)' : currentRSI < 30 ? '(超賣)' : ''}
          </span>
        )}
      </div>

      {/* Main Price Chart */}
      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 11 }}
            tickFormatter={(value) => {
              const date = new Date(value);
              return `${date.getMonth() + 1}/${date.getDate()}`;
            }}
          />
          <YAxis 
            domain={priceDomain}
            tick={{ fontSize: 11 }}
            tickFormatter={(value) => `$${value.toFixed(0)}`}
          />
          <Tooltip 
            formatter={(value, name) => {
              if (value === null) return [null, null];
              return [`$${Number(value).toFixed(2)}`, name];
            }}
            labelFormatter={(label) => `日期: ${label}`}
          />
          
          {/* Bollinger Bands Area */}
          {showBollinger && (
            <Area
              type="monotone"
              dataKey="bbUpper"
              stroke="#9333EA"
              strokeWidth={1}
              fill="none"
              dot={false}
              connectNulls
            />
          )}
          {showBollinger && (
            <Area
              type="monotone"
              dataKey="bbLower"
              stroke="#9333EA"
              strokeWidth={1}
              fill="#9333EA"
              fillOpacity={0.1}
              dot={false}
              connectNulls
            />
          )}

          {/* Price Area */}
          <Area 
            type="monotone" 
            dataKey="price" 
            fill="#3B82F6" 
            fillOpacity={0.15} 
            stroke="#3B82F6" 
            strokeWidth={2}
          />

          {/* MA Lines */}
          {showMA20 && (
            <Line 
              type="monotone" 
              dataKey="ma20" 
              stroke="#F59E0B" 
              strokeWidth={1.5}
              dot={false}
              connectNulls
            />
          )}
          {showMA50 && (
            <Line 
              type="monotone" 
              dataKey="ma50" 
              stroke="#10B981" 
              strokeWidth={1.5}
              dot={false}
              connectNulls
            />
          )}
          {showMA200 && (
            <Line 
              type="monotone" 
              dataKey="ma200" 
              stroke="#EC4899" 
              strokeWidth={1.5}
              dot={false}
              connectNulls
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>

      {/* Volume Chart - Red/Green based on price direction */}
      {showVolumeBars && (
        <ResponsiveContainer width="100%" height={80} className="mt-2">
          <BarChart data={data}>
            <XAxis dataKey="date" hide />
            <YAxis hide domain={['auto', 'auto']} />
            <Tooltip 
              formatter={(value, name) => [value?.toLocaleString(), '成交量']}
              contentStyle={{ fontSize: 12 }}
            />
            <Bar dataKey="volume" opacity={0.8}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.volumeColor} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}

      {/* RSI Chart */}
      {showRSI && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-xs font-medium text-gray-600 mb-2">RSI (14)</p>
          <ResponsiveContainer width="100%" height={100}>
            <LineChart data={rsiData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="date" hide />
              <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} tickCount={3} />
              <Tooltip 
                formatter={(value, name) => [typeof value === 'number' ? value.toFixed(1) : value, 'RSI']}
                contentStyle={{ fontSize: 12 }}
              />
              {/* Reference lines */}
              <ReferenceLine y={70} stroke="#EF4444" strokeDasharray="5 5" />
              <ReferenceLine y={30} stroke="#22C55E" strokeDasharray="5 5" />
              {/* RSI line */}
              <Line 
                type="monotone" 
                dataKey="rsi" 
                stroke="#F97316" 
                strokeWidth={2}
                dot={false}
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0</span>
            <span className="text-green-600">30 超賣</span>
            <span className="text-gray-400">50</span>
            <span className="text-red-600">70 超買</span>
            <span>100</span>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="mt-2 flex flex-wrap gap-4 justify-center text-xs">
        <span className="flex items-center gap-1">
          <span className="w-3 h-0.5 bg-blue-500"></span> 價格
        </span>
        {showMA20 && (
          <span className="flex items-center gap-1">
            <span className="w-3 h-0.5 bg-amber-500"></span> MA20
          </span>
        )}
        {showMA50 && (
          <span className="flex items-center gap-1">
            <span className="w-3 h-0.5 bg-emerald-500"></span> MA50
          </span>
        )}
        {showMA200 && (
          <span className="flex items-center gap-1">
            <span className="w-3 h-0.5 bg-pink-500"></span> MA200
          </span>
        )}
        {showBollinger && (
          <span className="flex items-center gap-1">
            <span className="w-3 h-0.5 bg-purple-500"></span> 布林帶
          </span>
        )}
        {showVolumeBars && (
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 bg-green-500"></span> 漲
            <span className="w-2 h-2 bg-red-500 ml-1"></span> 跌
          </span>
        )}
      </div>
    </div>
  );
}