import { NextResponse } from 'next/server';
import YahooFinance from 'yahoo-finance2';

const yahooFinance = new (YahooFinance as any)({ suppressNotices: ['yahooSurvey', 'ripHistorical'] });

export async function POST(req: Request) {
  try {
    const { tickers } = await req.json();
    if (!tickers || !Array.isArray(tickers) || tickers.length === 0) {
      return NextResponse.json([]);
    }

    const rawQuotes = await yahooFinance.quote(tickers);
    const quotes = Array.isArray(rawQuotes) ? rawQuotes : [rawQuotes];
    
    // Placeholder logic for sectors (since quote doesn't always guarantee sector info easily)
    const sectors = ['Technology', 'Financials', 'Healthcare', 'Consumer Discretionary', 'Energy', 'Industrials'];
    
    const data = quotes.map((q) => {
      // Create a deterministic hash for sector assignment
      const charCodeSum = q.symbol.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
      const sector = sectors[charCodeSum % sectors.length];
      
      return {
        ticker: q.symbol,
        currentPrice: q.regularMarketPrice || 0,
        sector: sector
      };
    });

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Tracker API error:', error);
    return NextResponse.json({ error: 'Failed to fetch live updates' }, { status: 500 });
  }
}
