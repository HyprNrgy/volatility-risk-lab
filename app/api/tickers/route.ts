import { NextResponse } from 'next/server';
import YahooFinance from 'yahoo-finance2';

const yahooFinance = new (YahooFinance as any)({ suppressNotices: ['yahooSurvey'] });

export const revalidate = 300; // Cache for 5 minutes

export async function GET() {
  const tickers = [
    'AAPL', 'MSFT', 'NVDA', 'TSLA', '^GSPC', '^IXIC', 
    'RELIANCE.NS', 'TCS.NS', 'HDFCBANK.NS', 'INFY.NS', '^NSEI', '^BSESN'
  ];

  try {
    const rawQuotes = await yahooFinance.quote(tickers);
    // Explicitly cast to any[] to satisfy the build-time type checker
    const quotes = Array.isArray(rawQuotes) ? (rawQuotes as any[]) : ([rawQuotes] as any[]);
    
    const data = quotes.map(q => ({
      symbol: q.symbol,
      price: q.regularMarketPrice,
      change: q.regularMarketChange,
      changePercent: q.regularMarketChangePercent,
      name: q.shortName || q.symbol
    }));

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Ticker fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch ticker data' }, { status: 500 });
  }
}
