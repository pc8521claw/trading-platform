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
    const { execSync } = require('child_process');
    
    // Use yfinance to get stock info (more reliable for marketCap)
    const pythonCode = `
import yfinance as yf
import json

try:
    ticker = yf.Ticker("${symbol}")
    info = ticker.info
    
    # Get values with fallbacks
    marketCap = info.get('marketCap') or 0
    sharesOutstanding = info.get('sharesOutstanding') or 0
    currentPrice = info.get('currentPrice') or info.get('regularMarketPrice') or 0
    previousClose = info.get('previousClose') or info.get('regularMarketPreviousClose') or currentPrice
    
    change = currentPrice - previousClose
    changePercent = (change / previousClose * 100) if previousClose else 0
    
    result = {
        'symbol': info.get('symbol', '${symbol}'),
        'name': info.get('shortName') or info.get('longName') or info.get('quoteType', '${symbol}'),
        'price': currentPrice,
        'change': change,
        'changePercent': changePercent,
        'volume': info.get('regularMarketVolume') or 0,
        'marketCap': marketCap,
        'sharesOutstanding': sharesOutstanding,
        'high52Week': info.get('fiftyTwoWeekHigh') or 0,
        'low52Week': info.get('fiftyTwoWeekLow') or 0,
        # Fundamental data (2026-05-28 added)
        'trailingPE': info.get('trailingPE') or None,
        'forwardPE': info.get('forwardPE') or None,
        'epsTrailingTwelveMonths': info.get('epsTrailingTwelveMonths') or None,
        'epsForward': info.get('epsForward') or None,
        'bookValue': info.get('bookValue') or None,
        'priceToBook': info.get('priceToBook') or None,
        'trailingEps': info.get('trailingEps') or None,
        'forwardEps': info.get('forwardEps') or None,
        'earningsGrowth': info.get('earningsGrowth') or None,
        'revenueGrowth': info.get('revenueGrowth') or None,
        'dividendYield': info.get('dividendYield') or None,
        'profitMargins': info.get('profitMargins') or None,
        'sector': info.get('sector') or None,
        'industry': info.get('industry') or None,
        'website': info.get('website') or None,
        'longBusinessSummary': info.get('longBusinessSummary') or None,
    }
    print(json.dumps(result))
except Exception as e:
    print(json.dumps({'error': str(e)}))
`;
    
    const output = execSync(`python3 -c "${pythonCode.replace(/"/g, '\\"')}"`, {
      encoding: 'utf-8',
      timeout: 10000,
    });
    
    const data = JSON.parse(output);
    
    if (data.error) {
      return NextResponse.json({ error: data.error }, { status: 500 });
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching stock quote:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stock data' },
      { status: 500 }
    );
  }
}