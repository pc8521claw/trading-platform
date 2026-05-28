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
    
    // Fetch both quote and quoteSummary in parallel for speed
    const [quoteData, summaryData] = await Promise.all([
      yf.quote(symbol),
      yf.quoteSummary(symbol, { 
        modules: ['defaultKeyStatistics', 'financialData', 'assetProfile'] 
      }).catch(() => null)
    ]);
    
    const currentPrice = quoteData.regularMarketPrice || 0;
    const previousClose = quoteData.regularMarketPreviousClose || quoteData.previousClose || currentPrice;
    const change = currentPrice - previousClose;
    const changePercent = previousClose ? (change / previousClose * 100) : 0;
    
    // Extract extra data from quoteSummary
    const keyStats = summaryData?.defaultKeyStatistics || {};
    const finData = summaryData?.financialData || {};
    const assetProfile = summaryData?.assetProfile || {};
    
    const result = {
      symbol: quoteData.symbol || symbol,
      name: quoteData.shortName || quoteData.longName || quoteData.quoteType || symbol,
      price: currentPrice,
      change: change,
      changePercent: changePercent,
      volume: quoteData.regularMarketVolume || 0,
      marketCap: quoteData.marketCap || 0,
      sharesOutstanding: quoteData.sharesOutstanding || 0,
      high52Week: quoteData.fiftyTwoWeekHigh || 0,
      low52Week: quoteData.fiftyTwoWeekLow || 0,
      // Fundamental data
      trailingPE: quoteData.trailingPE || null,
      forwardPE: quoteData.forwardPE || null,
      epsTrailingTwelveMonths: quoteData.epsTrailingTwelveMonths || null,
      epsForward: quoteData.epsForward || null,
      bookValue: quoteData.bookValue || null,
      priceToBook: quoteData.priceToBook || null,
      trailingEps: keyStats.trailingEps || null,
      forwardEps: keyStats.forwardEps || null,
      // Growth from financialData
      earningsGrowth: finData.earningsGrowth || null,
      revenueGrowth: finData.revenueGrowth || null,
      dividendYield: quoteData.dividendYield || keyStats.dividendYield || finData.dividendYield || null,
      profitMargins: finData.profitMargins || null,
      sector: assetProfile.sector || null,
      industry: assetProfile.industry || null,
      website: assetProfile.website || null,
      longBusinessSummary: assetProfile.longBusinessSummary || null,
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