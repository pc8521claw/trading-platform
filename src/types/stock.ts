// Stock types

export interface StockInfo {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  sharesOutstanding?: number;  //流通股數
  high52Week: number;
  low52Week: number;
  // Fundamental data
  trailingPE?: number;
  forwardPE?: number;
  epsTrailingTwelveMonths?: number;
  epsForward?: number;
  bookValue?: number;
  priceToBook?: number;
  trailingEps?: number;
  forwardEps?: number;
  earningsGrowth?: number;
  revenueGrowth?: number;
  dividendYield?: number;
  profitMargins?: number;
  sector?: string;
  industry?: string;
  website?: string;
  longBusinessSummary?: string;
}

export interface StockQuote {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface TechnicalIndicators {
  rsi: number | null;
  macd: {
    value: number;
    signal: number;
    histogram: number;
  } | null;
  sma: {
    ma20: number | null;
    ma50: number | null;
    ma200: number | null;
  };
  ema: {
    ema12: number | null;
    ema26: number | null;
  };
  bollingerBands: {
    upper: number;
    middle: number;
    lower: number;
  } | null;
}

export interface BacktestResult {
  strategy: string;
  finalValue: number;
  returnPercent: number;
  sharpeRatio: number;
  trades: Trade[];
}

export interface Trade {
  date: string;
  type: 'BUY' | 'SELL';
  price: number;
  shares: number;
}

export interface Prediction {
  symbol: string;
  currentPrice: number;
  predictedPrice: number;
  expectedChange: number;
  confidence: number;
  days: number;
  predictedPrices?: { day: number; price: number; upper?: number; lower?: number }[];
}

export interface ScreenerSignal {
  id: string;
  name: string;
  description: string;
  active: boolean;
}
