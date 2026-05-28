import { NextResponse } from 'next/server';

// Rate limiting
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 2000;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get('symbol');

  if (!symbol) {
    return NextResponse.json({ error: 'Symbol is required' }, { status: 400 });
  }

  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  
  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    await new Promise(resolve => setTimeout(resolve, MIN_REQUEST_INTERVAL - timeSinceLastRequest));
  }
  
  lastRequestTime = Date.now();

  try {
    const YahooFinance = require('yahoo-finance2').default;
    const yf = new YahooFinance({ suppressNotices: ['yahooSurvey'] });
    const data = await yf.quote(symbol);
    
    const currentPrice = data.regularMarketPrice || 0;
    const previousClose = data.regularMarketPreviousClose || data.previousClose || currentPrice;
    const change = currentPrice - previousClose;
    const changePercent = previousClose ? (change / previousClose * 100) : 0;
    
    const result = {
      symbol: data.symbol || symbol,
      name: data.shortName || data.longName || data.quoteType || symbol,
      price: currentPrice,
      change: change,
      changePercent: changePercent,
      volume: data.regularMarketVolume || 0,
      marketCap: data.marketCap || 0,
      sharesOutstanding: data.sharesOutstanding || 0,
      high52Week: data.fiftyTwoWeekHigh || 0,
      low52Week: data.fiftyTwoWeekLow || 0,
      // Fundamental data
      trailingPE: data.trailingPE || null,
      forwardPE: data.forwardPE || null,
      epsTrailingTwelveMonths: data.epsTrailingTwelveMonths || null,
      epsForward: data.epsForward || null,
      bookValue: data.bookValue || null,
      priceToBook: data.priceToBook || null,
      trailingEps: data.trailingEps || null,
      forwardEps: data.forwardEps || null,
      earningsGrowth: data.earningsGrowth || null,
      revenueGrowth: data.revenueGrowth || null,
      dividendYield: data.dividendYield || null,
      profitMargins: data.profitMargins || null,
      sector: data.sector || null,
      industry: data.industry || null,
      website: data.website || null,
      longBusinessSummary: data.longBusinessSummary || null,
    };
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching stock quote:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stock data' },
      { status: 500 }
    );
  }
}