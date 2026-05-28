import { StockQuote, TechnicalIndicators, BacktestResult, Trade } from '@/types/stock';

// Simple Moving Average
export function calculateSMA(prices: number[], period: number): number | null {
  if (prices.length < period) return null;
  const sum = prices.slice(-period).reduce((a, b) => a + b, 0);
  return sum / period;
}

// Exponential Moving Average
export function calculateEMA(prices: number[], period: number): number | null {
  if (prices.length < period) return null;
  
  const multiplier = 2 / (period + 1);
  let ema = prices.slice(0, period).reduce((a, b) => a + b, 0) / period;
  
  for (let i = period; i < prices.length; i++) {
    ema = (prices[i] - ema) * multiplier + ema;
  }
  
  return ema;
}

// Relative Strength Index
export function calculateRSI(prices: number[], period: number = 14): number | null {
  if (prices.length < period + 1) return null;
  
  let gains = 0;
  let losses = 0;
  
  for (let i = prices.length - period; i < prices.length; i++) {
    const change = prices[i] - prices[i - 1];
    if (change > 0) gains += change;
    else losses -= change;
  }
  
  const avgGain = gains / period;
  const avgLoss = losses / period;
  
  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - (100 / (1 + rs));
}

// MACD
export function calculateMACD(
  prices: number[],
  fastPeriod: number = 12,
  slowPeriod: number = 26,
  signalPeriod: number = 9
): { value: number; signal: number; histogram: number } | null {
  const ema12 = calculateEMA(prices, fastPeriod);
  const ema26 = calculateEMA(prices, slowPeriod);
  
  if (!ema12 || !ema26) return null;
  
  const macdLine = ema12 - ema26;
  const signal = macdLine * 0.9;

  return {
    value: macdLine,
    signal: signal,
    histogram: macdLine - signal,
  };
}

// Bollinger Bands
export function calculateBollingerBands(
  prices: number[],
  period: number = 20,
  stdDev: number = 2
): { upper: number; middle: number; lower: number } | null {
  const sma = calculateSMA(prices, period);
  if (!sma) return null;
  
  const recentPrices = prices.slice(-period);
  const squaredDiffs = recentPrices.map(p => Math.pow(p - sma, 2));
  const variance = squaredDiffs.reduce((a, b) => a + b, 0) / period;
  const std = Math.sqrt(variance);
  
  return {
    upper: sma + (std * stdDev),
    middle: sma,
    lower: sma - (std * stdDev),
  };
}

// Calculate all technical indicators
export function calculateAllIndicators(quotes: StockQuote[]): TechnicalIndicators {
  const closes = quotes.map(q => q.close);
  
  return {
    rsi: calculateRSI(closes),
    macd: calculateMACD(closes),
    sma: {
      ma20: calculateSMA(closes, 20),
      ma50: calculateSMA(closes, 50),
      ma200: calculateSMA(closes, 200),
    },
    ema: {
      ema12: calculateEMA(closes, 12),
      ema26: calculateEMA(closes, 26),
    },
    bollingerBands: calculateBollingerBands(closes),
  };
}

// Base backtest function
function baseBacktest(
  quotes: StockQuote[],
  initialCapital: number,
  strategyName: string,
  generateSignals: (closes: number[], quotes: StockQuote[]) => { buy: boolean, sell: boolean }
): BacktestResult {
  const closes = quotes.map(q => q.close);
  const trades: Trade[] = [];
  let cash = initialCapital;
  let shares = 0;
  let position: 'IN' | 'OUT' = 'OUT';
  
  const startIndex = 50; // Need enough data for indicators
  
  for (let i = startIndex; i < closes.length; i++) {
    const { buy, sell } = generateSignals(closes.slice(0, i + 1), quotes.slice(0, i + 1));
    
    if (buy && position === 'OUT') {
      shares = Math.floor(cash / quotes[i].close);
      if (shares > 0) {
        cash -= shares * quotes[i].close;
        trades.push({
          date: quotes[i].date,
          type: 'BUY',
          price: quotes[i].close,
          shares,
        });
        position = 'IN';
      }
    } else if (sell && position === 'IN') {
      const revenue = shares * quotes[i].close;
      cash += revenue;
      trades.push({
        date: quotes[i].date,
        type: 'SELL',
        price: quotes[i].close,
        shares,
      });
      position = 'OUT';
      shares = 0;
    }
  }
  
  // Close final position
  if (position === 'IN' && shares > 0) {
    cash += shares * closes[closes.length - 1];
    trades.push({
      date: quotes[quotes.length - 1].date,
      type: 'SELL',
      price: closes[closes.length - 1],
      shares,
    });
    shares = 0;
  }
  
  const finalValue = cash;
  const returnPercent = ((finalValue - initialCapital) / initialCapital) * 100;
  const sharpeRatio = calculateSharpeRatio(closes);
  
  return {
    strategy: strategyName,
    finalValue,
    returnPercent,
    sharpeRatio,
    trades,
  };
}

function calculateSharpeRatio(prices: number[]): number {
  if (prices.length < 2) return 0;
  
  const returns: number[] = [];
  for (let i = 1; i < prices.length; i++) {
    returns.push((prices[i] - prices[i - 1]) / prices[i - 1]);
  }
  
  if (returns.length === 0) return 0;
  
  const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
  const variance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length;
  const stdReturn = Math.sqrt(variance);
  
  if (stdReturn === 0) return 0;
  return (avgReturn * 252) / (stdReturn * Math.sqrt(252));
}

// Strategy 1: MA Cross
export function backtestMACross(
  quotes: StockQuote[],
  shortPeriod: number = 20,
  longPeriod: number = 50,
  initialCapital: number = 10000
): BacktestResult {
  return baseBacktest(quotes, initialCapital, `MA Cross (${shortPeriod}/${longPeriod})`, (closes) => {
    const shortMA = calculateSMA(closes, shortPeriod);
    const longMA = calculateSMA(closes, longPeriod);
    const prevShortMA = calculateSMA(closes.slice(0, -1), shortPeriod);
    const prevLongMA = calculateSMA(closes.slice(0, -1), longPeriod);
    
    if (!shortMA || !longMA || !prevShortMA || !prevLongMA) {
      return { buy: false, sell: false };
    }
    
    const buy = prevShortMA <= prevLongMA && shortMA > longMA;
    const sell = prevShortMA >= prevLongMA && shortMA < longMA;
    
    return { buy, sell };
  });
}

// Strategy 2: RSI
export function backtestRSI(
  quotes: StockQuote[],
  period: number = 14,
  oversold: number = 30,
  overbought: number = 70,
  initialCapital: number = 10000
): BacktestResult {
  return baseBacktest(quotes, initialCapital, `RSI (${period})`, (closes) => {
    const rsi = calculateRSI(closes, period);
    const prevRsi = calculateRSI(closes.slice(0, -1), period);
    
    if (!rsi || !prevRsi) {
      return { buy: false, sell: false };
    }
    
    const buy = prevRsi <= oversold && rsi > oversold;
    const sell = prevRsi >= overbought && rsi < overbought;
    
    return { buy, sell };
  });
}

// Strategy 3: MACD
export function backtestMACD(
  quotes: StockQuote[],
  initialCapital: number = 10000
): BacktestResult {
  return baseBacktest(quotes, initialCapital, 'MACD', (closes) => {
    const macd = calculateMACD(closes);
    const prevMacd = calculateMACD(closes.slice(0, -1));
    
    if (!macd || !prevMacd) {
      return { buy: false, sell: false };
    }
    
    const buy = prevMacd.histogram <= 0 && macd.histogram > 0;
    const sell = prevMacd.histogram >= 0 && macd.histogram < 0;
    
    return { buy, sell };
  });
}

// Strategy 4: Bollinger Bands
export function backtestBollinger(
  quotes: StockQuote[],
  period: number = 20,
  stdDev: number = 2,
  initialCapital: number = 10000
): BacktestResult {
  return baseBacktest(quotes, initialCapital, `Bollinger Bands (${period})`, (closes) => {
    const bb = calculateBollingerBands(closes, period, stdDev);
    const prevBb = calculateBollingerBands(closes.slice(0, -1), period, stdDev);
    const currentPrice = closes[closes.length - 1];
    const prevPrice = closes[closes.length - 2];
    
    if (!bb || !prevBb) {
      return { buy: false, sell: false };
    }
    
    // Buy when price crosses below lower band, sell when it crosses above upper band
    const buy = prevPrice >= prevBb.lower && currentPrice < bb.lower;
    const sell = prevPrice <= prevBb.upper && currentPrice > bb.upper;
    
    return { buy, sell };
  });
}

// Strategy 5: Momentum
export function backtestMomentum(
  quotes: StockQuote[],
  period: number = 10,
  threshold: number = 0.02,
  initialCapital: number = 10000
): BacktestResult {
  return baseBacktest(quotes, initialCapital, `Momentum (${period})`, (closes) => {
    if (closes.length < period + 1) {
      return { buy: false, sell: false };
    }
    
    const currentMomentum = (closes[closes.length - 1] - closes[closes.length - period - 1]) / closes[closes.length - period - 1];
    const prevMomentum = (closes[closes.length - 2] - closes[closes.length - period - 2]) / closes[closes.length - period - 2];
    
    const buy = prevMomentum < threshold && currentMomentum >= threshold;
    const sell = prevMomentum > -threshold && currentMomentum <= -threshold;
    
    return { buy, sell };
  });
}

export type StrategyType = 'ma_cross' | 'rsi' | 'macd' | 'bollinger' | 'momentum';

export interface StrategyConfig {
  id: StrategyType;
  name: string;
  description: string;
  params?: { key: string; name: string; min: number; max: number; step: number; default: number }[];
}

export const STRATEGIES: StrategyConfig[] = [
  { 
    id: 'ma_cross', 
    name: 'MA 交叉', 
    description: '移動平均線交叉策略',
    params: [
      { key: 'shortMA', name: '短期MA', min: 5, max: 50, step: 5, default: 20 },
      { key: 'longMA', name: '長期MA', min: 20, max: 200, step: 10, default: 50 },
    ]
  },
  { 
    id: 'rsi', 
    name: 'RSI 超買賣', 
    description: '相對強度指數策略',
    params: [
      { key: 'rsiPeriod', name: 'RSI週期', min: 7, max: 21, step: 1, default: 14 },
      { key: 'oversold', name: '超賣 threshold', min: 20, max: 40, step: 5, default: 30 },
      { key: 'overbought', name: '超買 threshold', min: 60, max: 80, step: 5, default: 70 },
    ]
  },
  { 
    id: 'macd', 
    name: 'MACD', 
    description: '指數平滑異同移動平均線',
  },
  { 
    id: 'bollinger', 
    name: '布林帶', 
    description: '布林帶突破策略',
    params: [
      { key: 'bbPeriod', name: '週期', min: 10, max: 30, step: 5, default: 20 },
      { key: 'bbStd', name: '標準差', min: 1, max: 3, step: 0.5, default: 2 },
    ]
  },
  { 
    id: 'momentum', 
    name: '動量策略', 
    description: '價格動量策略',
    params: [
      { key: 'momentumPeriod', name: '動量週期', min: 5, max: 20, step: 1, default: 10 },
    ]
  },
];

export function runBacktest(
  quotes: StockQuote[],
  strategyId: StrategyType,
  params: Record<string, number>,
  initialCapital: number = 10000
): BacktestResult {
  switch (strategyId) {
    case 'ma_cross':
      return backtestMACross(quotes, params.shortMA || 20, params.longMA || 50, initialCapital);
    case 'rsi':
      return backtestRSI(quotes, params.rsiPeriod || 14, params.oversold || 30, params.overbought || 70, initialCapital);
    case 'macd':
      return backtestMACD(quotes, initialCapital);
    case 'bollinger':
      return backtestBollinger(quotes, params.bbPeriod || 20, params.bbStd || 2, initialCapital);
    case 'momentum':
      return backtestMomentum(quotes, params.momentumPeriod || 10, 0.02, initialCapital);
    default:
      return backtestMACross(quotes, 20, 50, initialCapital);
  }
}

// Simple price prediction (linear regression based)
export function predictPrice(
  quotes: StockQuote[],
  days: number = 30
): { predictedPrice: number; expectedChange: number; confidence: number; predictedPrices: { day: number; price: number }[] } {
  const closes = quotes.map(q => q.close);
  const n = closes.length;
  
  if (n < 30) {
    return {
      predictedPrice: closes[n - 1],
      expectedChange: 0,
      confidence: 0,
      predictedPrices: [],
    };
  }
  
  // Simple linear regression
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
  for (let i = 0; i < n; i++) {
    sumX += i;
    sumY += closes[i];
    sumXY += i * closes[i];
    sumX2 += i * i;
  }
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  
  const predictedPrice = intercept + slope * (n + days - 1);
  const currentPrice = closes[n - 1];
  const expectedChange = ((predictedPrice - currentPrice) / currentPrice) * 100;
  
  // Calculate R-squared for confidence
  const yMean = sumY / n;
  let ssTot = 0, ssRes = 0;
  for (let i = 0; i < n; i++) {
    const yPred = intercept + slope * i;
    ssTot += Math.pow(closes[i] - yMean, 2);
    ssRes += Math.pow(closes[i] - yPred, 2);
  }
  const rSquared = 1 - (ssRes / ssTot);
  const confidence = Math.max(0, Math.min(100, rSquared * 100));
  
  // Calculate standard error for confidence interval
  const standardError = Math.sqrt(ssRes / (n - 2));
  
  // Confidence multiplier (95% interval ~ 1.96)
  const confidenceMultiplier = 1.96;
  
  return {
    predictedPrice: Math.max(0, predictedPrice),
    expectedChange,
    confidence,
    predictedPrices: Array.from({ length: days }, (_, i) => {
      const dayIndex = n + i;
      const basePrice = intercept + slope * dayIndex;
      // Confidence interval widens as we predict further into future
      const margin = standardError * confidenceMultiplier * (1 + (i / days) * 2);
      return {
        day: i + 1,
        price: Math.max(0, basePrice),
        upper: Math.max(0, basePrice + margin),
        lower: Math.max(0, basePrice - margin),
      };
    }),
  };
}

// Multi-Model Price Prediction
interface ModelResult {
  name: string;
  predictedPrices: number[];
  confidence: number;
  weight: number;
}

// Model 1: Linear Regression
function linearRegressionForecast(closes: number[], days: number): number[] {
  const n = closes.length;
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
  for (let i = 0; i < n; i++) {
    sumX += i;
    sumY += closes[i];
    sumXY += i * closes[i];
    sumX2 += i * i;
  }
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  
  return Array.from({ length: days }, (_, i) => intercept + slope * (n + i));
}

// Model 2: Moving Average Forecast (mean reversion)
function maForecast(closes: number[], days: number): number[] {
  // Use last 20 days MA as baseline
  const ma = closes.slice(-20).reduce((a, b) => a + b, 0) / Math.min(20, closes.length);
  const current = closes[closes.length - 1];
  
  // Mean reversion: gradually move towards MA
  const prices: number[] = [];
  for (let i = 0; i < days; i++) {
    const alpha = (i + 1) / days; // gradually increase weight towards MA
    prices.push(current * (1 - alpha) + ma * alpha);
  }
  return prices;
}

// Model 3: Momentum Forecast
function momentumForecast(closes: number[], days: number): number[] {
  // Calculate recent trend (last 10 days)
  const recentReturns: number[] = [];
  for (let i = Math.max(0, closes.length - 10); i < closes.length - 1; i++) {
    recentReturns.push((closes[i + 1] - closes[i]) / closes[i]);
  }
  const avgReturn = recentReturns.reduce((a, b) => a + b, 0) / recentReturns.length;
  const stdReturn = Math.sqrt(recentReturns.map(r => Math.pow(r - avgReturn, 2)).reduce((a, b) => a + b, 0) / recentReturns.length);
  
  // Project with dampening (momentum decays)
  const current = closes[closes.length - 1];
  return Array.from({ length: days }, (_, i) => {
    const dampedReturn = avgReturn * Math.pow(0.95, i); // decay factor
    return current * Math.pow(1 + dampedReturn, i + 1);
  });
}

// Model 4: Simple Price Channel (recent range projection)
function priceChannelForecast(closes: number[], days: number): number[] {
  const recentHigh = Math.max(...closes.slice(-20));
  const recentLow = Math.min(...closes.slice(-20));
  const mid = (recentHigh + recentLow) / 2;
  const current = closes[closes.length - 1];
  
  // If above mid, expect lower; if below mid, expect higher
  const bias = current > mid ? -0.5 : 0.5;
  const rangeSize = recentHigh - recentLow;
  
  return Array.from({ length: days }, (_, i) => {
    const alpha = (i + 1) / days;
    const target = mid + bias * rangeSize * alpha;
    return current * (1 - alpha) + target * alpha;
  });
}

// Ensemble prediction
export interface EnsemblePrediction {
  models: ModelResult[];
  ensemblePrices: number[];
  avgConfidence: number;
}

export function predictPriceEnsemble(
  quotes: StockQuote[],
  days: number = 30
): EnsemblePrediction {
  const closes = quotes.map(q => q.close);
  
  if (closes.length < 30) {
    return {
      models: [],
      ensemblePrices: [],
      avgConfidence: 0,
    };
  }
  
  // Run all 4 models
  const modelPrices = [
    linearRegressionForecast(closes, days),
    maForecast(closes, days),
    momentumForecast(closes, days),
    priceChannelForecast(closes, days),
  ];
  
  const modelNames = ['線性回歸', '均值回歸', '動量', '價格通道'];
  const modelWeights = [0.3, 0.25, 0.25, 0.2]; // weights sum to 1
  
  // Calculate confidence for each model
  // Each model has different confidence based on its characteristics
  const confidences = modelPrices.map((prices, modelIndex) => {
    // Use coefficient of variation from historical prices as proxy
    // Different models have different risk profiles
    const recentPrices = closes.slice(-20);
    const mean = recentPrices.reduce((a, b) => a + b, 0) / recentPrices.length;
    const variance = recentPrices.reduce((a, c) => a + Math.pow(c - mean, 2), 0) / recentPrices.length;
    const stdDev = Math.sqrt(variance);
    const cv = stdDev / mean; // coefficient of variation (lower = more stable)
    
    // Base confidence ranges for each model type
    // More stable models get higher base confidence
    const baseRanges = [
      { base: 75, stability: 0.8 },  // Linear regression - most stable
      { base: 70, stability: 0.85 }, // Mean reversion - very stable
      { base: 55, stability: 0.6 },  // Momentum - volatile
      { base: 65, stability: 0.7 },  // Price channel - moderate
    ];
    
    const config = baseRanges[modelIndex] || { base: 65, stability: 0.7 };
    
    // Confidence adjusted by both model stability and price stability
    // Lower CV (more stable) = higher confidence multiplier
    const stabilityMultiplier = Math.max(0.5, Math.min(1.0, 1 - cv * 3));
    const confidence = config.base * config.stability * stabilityMultiplier;
    
    return Math.max(25, Math.min(90, confidence));
  });
  
  const models: ModelResult[] = modelNames.map((name, i) => ({
    name,
    predictedPrices: modelPrices[i],
    confidence: confidences[i],
    weight: modelWeights[i],
  }));
  
  // Ensemble: weighted average
  const ensemblePrices = Array.from({ length: days }, (_, dayIndex) => {
    let sum = 0;
    for (let i = 0; i < modelPrices.length; i++) {
      sum += modelPrices[i][dayIndex] * modelWeights[i];
    }
    return sum;
  });
  
  // Average confidence
  const avgConfidence = confidences.reduce((a, b) => a + b, 0) / confidences.length;
  
  return {
    models,
    ensemblePrices,
    avgConfidence,
  };
}
