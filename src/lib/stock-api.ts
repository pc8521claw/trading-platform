import { StockInfo, StockQuote } from '@/types/stock';

const API_BASE = '/api/stock';

export async function getStockQuote(symbol: string): Promise<StockInfo | null> {
  try {
    const response = await fetch(`${API_BASE}/quote?symbol=${encodeURIComponent(symbol)}`);
    
    if (!response.ok) {
      console.error('Failed to fetch quote:', response.status);
      return null;
    }
    
    const data = await response.json();
    
    if (data.error) {
      console.error('Quote API error:', data.error);
      return null;
    }
    
    // Check if it's chart format or direct format
    if (data.chart?.result?.[0]) {
      const result = data.chart.result[0];
      const meta = result.meta;
      
      const currentPrice = meta.regularMarketPrice || 0;
      const previousClose = meta.previousClose || currentPrice;
      const change = currentPrice - previousClose;
      const changePercent = previousClose ? (change / previousClose) * 100 : 0;
      
      return {
        symbol: meta.symbol || symbol,
        name: meta.shortName || meta.longName || symbol,
        price: currentPrice,
        change: change,
        changePercent: changePercent,
        volume: meta.regularMarketVolume || 0,
        marketCap: meta.marketCap || 0,
        sharesOutstanding: meta.sharesOutstanding || 0,
        high52Week: meta.fiftyTwoWeekHigh || 0,
        low52Week: meta.fiftyTwoWeekLow || 0,
      };
    }
    
    // Direct format from quote endpoint
    if (data.symbol) {
      return {
        symbol: data.symbol,
        name: data.name || data.symbol,
        price: data.price || 0,
        change: data.change || 0,
        changePercent: data.changePercent || 0,
        volume: data.volume || 0,
        marketCap: data.marketCap || 0,
        sharesOutstanding: data.sharesOutstanding || 0,
        high52Week: data.high52Week || 0,
        low52Week: data.low52Week || 0,
        // Fundamental data
        trailingPE: data.trailingPE,
        forwardPE: data.forwardPE,
        epsTrailingTwelveMonths: data.epsTrailingTwelveMonths,
        epsForward: data.epsForward,
        bookValue: data.bookValue,
        priceToBook: data.priceToBook,
        trailingEps: data.trailingEps,
        forwardEps: data.forwardEps,
        earningsGrowth: data.earningsGrowth,
        revenueGrowth: data.revenueGrowth,
        dividendYield: data.dividendYield,
        profitMargins: data.profitMargins,
        sector: data.sector,
        industry: data.industry,
        website: data.website,
        longBusinessSummary: data.longBusinessSummary,
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching stock quote:', error);
    return null;
  }
}

export async function getStockHistory(
  symbol: string, 
  interval: string = '1d',
  range: string = '1y'
): Promise<StockQuote[]> {
  try {
    const response = await fetch(
      `${API_BASE}/history?symbol=${encodeURIComponent(symbol)}&interval=${interval}&range=${range}`
    );
    
    if (!response.ok) {
      console.error('Failed to fetch history:', response.status);
      return [];
    }
    
    const data = await response.json();
    
    if (data.error) {
      console.error('History API error:', data.error);
      return [];
    }
    
    if (!data.chart?.result?.[0]) {
      return [];
    }
    
    const result = data.chart.result[0];
    const timestamps = result.timestamp || [];
    const quote = result.indicators?.quote?.[0];
    
    if (!timestamps.length || !quote) {
      return [];
    }
    
    return timestamps.map((ts: number, i: number) => ({
      date: new Date(ts * 1000).toISOString().split('T')[0],
      open: quote.open?.[i] || 0,
      high: quote.high?.[i] || 0,
      low: quote.low?.[i] || 0,
      close: quote.close?.[i] || 0,
      volume: quote.volume?.[i] || 0,
    })).filter((q: StockQuote) => q.close > 0);
  } catch (error) {
    console.error('Error fetching stock history:', error);
    return [];
  }
}

export async function searchStocks(query: string): Promise<Array<{symbol: string, name: string}>> {
  try {
    // Use Yahoo Finance search via proxy
    const response = await fetch(
      `https://query2.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(query)}`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        },
      }
    );
    
    if (!response.ok) {
      return POPULAR_STOCKS;
    }
    
    const data = await response.json();
    
    return (data.quotes || [])
      .filter((q: any) => q.quoteType === 'EQUITY')
      .slice(0, 10)
      .map((q: any) => ({
        symbol: q.symbol,
        name: q.shortName || q.longName || q.symbol,
      }));
  } catch (error) {
    console.error('Error searching stocks:', error);
    return POPULAR_STOCKS;
  }
}

export const POPULAR_STOCKS = [
  // US Stocks
  { symbol: 'AAPL', name: 'Apple Inc.' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.' },
  { symbol: 'MSFT', name: 'Microsoft Corporation' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.' },
  { symbol: 'TSLA', name: 'Tesla Inc.' },
  { symbol: 'META', name: 'Meta Platforms Inc.' },
  { symbol: 'NVDA', name: 'NVIDIA Corporation' },
  { symbol: 'JPM', name: 'JPMorgan Chase & Co.' },
  { symbol: 'V', name: 'Visa Inc.' },
  { symbol: 'JNJ', name: 'Johnson & Johnson' },
  // Hong Kong Stocks
  { symbol: '0700.HK', name: '騰訊控股' },
  { symbol: '9988.HK', name: '阿里巴巴' },
  { symbol: '0941.HK', name: '中國移動' },
  { symbol: '0005.HK', name: '匯豐控股' },
  { symbol: '3690.HK', name: '美團' },
  { symbol: '9618.HK', name: '京東集團' },
  { symbol: '1024.HK', name: '快手科技' },
  { symbol: '1211.HK', name: '比亞迪股份' },
  { symbol: '1810.HK', name: '小米集團' },
  { symbol: '2382.HK', name: '舜宇光學科技' },
];