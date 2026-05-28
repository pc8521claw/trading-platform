import { NextResponse } from 'next/server';

const YAHOO_FINANCE_SEARCH = 'https://query2.finance.yahoo.com/v1/finance/search';

// Popular HK stocks with Chinese names (for fallback when no query)
const POPULAR_HK_STOCKS = [
  { symbol: '0700.HK', nameZh: '騰訊控股' },
  { symbol: '0005.HK', nameZh: '匯豐控股' },
  { symbol: '9988.HK', nameZh: '阿里巴巴' },
  { symbol: '0941.HK', nameZh: '中國移動' },
  { symbol: '3690.HK', nameZh: '美團' },
  { symbol: '9618.HK', nameZh: '京東' },
  { symbol: '1810.HK', nameZh: '小米集團' },
  { symbol: '1211.HK', nameZh: '比亞迪' },
  { symbol: '2318.HK', nameZh: '中國平安' },
  { symbol: '1299.HK', nameZh: '友邦保險' },
  { symbol: '1398.HK', nameZh: '工商銀行' },
  { symbol: '3988.HK', nameZh: '中國銀行' },
  { symbol: '2628.HK', nameZh: '中國人壽' },
  { symbol: '3969.HK', nameZh: '銀河娛樂' },
  { symbol: '0012.HK', nameZh: '恒基地產' },
  { symbol: '0016.HK', nameZh: '新鴻基地產' },
  { symbol: '0669.HK', nameZh: '創科實業' },
  { symbol: '0175.HK', nameZh: '吉利汽車' },
  { symbol: '2020.HK', nameZh: '安踏體育' },
  { symbol: '2319.HK', nameZh: '蒙牛乳業' },
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  // If no query, return popular HK stocks
  if (!query) {
    return NextResponse.json(POPULAR_HK_STOCKS);
  }

  try {
    // Search Yahoo Finance
    const response = await fetch(
      `${YAHOO_FINANCE_SEARCH}?q=${encodeURIComponent(query)}`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        },
      }
    );

    if (!response.ok) {
      return NextResponse.json([]);
    }

    const data = await response.json();
    
    const results = (data.quotes || [])
      .filter((q: any) => q.quoteType === 'EQUITY')
      .slice(0, 15)
      .map((q: any) => {
        // Use Yahoo's shortName if available, otherwise use symbol
        // Yahoo tends to return Chinese names for HK stocks when available
        const yahooName = q.shortName || q.longName || q.symbol;
        
        return {
          symbol: q.symbol,
          name: yahooName,
          nameZh: yahooName, // Yahoo already returns Chinese if available
        };
      });

    return NextResponse.json(results);
  } catch (error) {
    console.error('Error searching stocks:', error);
    return NextResponse.json([]);
  }
}