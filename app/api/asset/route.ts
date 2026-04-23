import { NextResponse } from 'next/server';
import YahooFinance from 'yahoo-finance2';
import { returns, rollingStd, std, mean, percentile, maxDrawdown, covariance, variance } from '@/lib/math';

const yahooFinance = new (YahooFinance as any)({ suppressNotices: ['yahooSurvey', 'ripHistorical'] });

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { ticker, startDate, endDate, benchmark = '^GSPC', logReturns = false } = body;

    if (!ticker || !startDate || !endDate) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const queryOptions = {
      period1: startDate,
      period2: endDate,
      interval: '1d' as const,
    };

    // Fetch asset and benchmark data in parallel
    let assetData: any[];
    let benchmarkData: any[];

    try {
      const [assetResult, benchmarkResult] = await Promise.all([
        yahooFinance.chart(ticker, queryOptions),
        yahooFinance.chart(benchmark, queryOptions)
      ]);
      assetData = assetResult.quotes;
      benchmarkData = benchmarkResult.quotes;
    } catch (e: any) {
      if (e.message && e.message.includes('No data found')) {
        return NextResponse.json({ error: `No data found for the ticker or benchmark provided.` }, { status: 404 });
      }
      throw e;
    }

    if (assetData.length === 0) {
      return NextResponse.json({ error: 'No data found for ticker' }, { status: 404 });
    }

    // Forward fill logic for missing data (yfinance usually returns clean data, but we implement logic)
    const dates = assetData.map(d => d.date.toISOString().split('T')[0]);
    const adjClose = assetData.map(d => d.adjclose || d.close);
    
    // Align benchmark data
    const benchMap = new Map(benchmarkData.map(d => [d.date.toISOString().split('T')[0], d.adjclose || d.close]));
    const benchClose = dates.map(d => benchMap.get(d) || null);

    // Forward fill benchmark
    let lastBench = benchClose.find(v => v !== null) || 1;
    for (let i = 0; i < benchClose.length; i++) {
      if (benchClose[i] === null) {
        benchClose[i] = lastBench;
      } else {
        lastBench = benchClose[i] as number;
      }
    }

    const assetReturns = returns(adjClose, logReturns);
    const benchReturns = returns(benchClose as number[], logReturns);

    // Remove first element (0) for accurate metrics
    const validAssetReturns = assetReturns.slice(1);
    const validBenchReturns = benchReturns.slice(1);

    const annVol = std(validAssetReturns) * Math.sqrt(252);
    const mdd = maxDrawdown(adjClose);
    
    const assetBenchCov = covariance(validAssetReturns, validBenchReturns);
    const benchVar = variance(validBenchReturns);
    const beta = benchVar === 0 ? 0 : assetBenchCov / benchVar;

    const histVaR95 = percentile(validAssetReturns, 5);
    const mu = mean(validAssetReturns);
    const sigma = std(validAssetReturns);
    const paramVaR95 = mu - 1.645 * sigma;

    const roll20 = rollingStd(assetReturns, 20).map(v => isNaN(v) ? null : v * Math.sqrt(252));
    const roll60 = rollingStd(assetReturns, 60).map(v => isNaN(v) ? null : v * Math.sqrt(252));
    const roll252 = rollingStd(assetReturns, 252).map(v => isNaN(v) ? null : v * Math.sqrt(252));

    const chartData = dates.map((date, i) => ({
      date,
      price: adjClose[i],
      return: assetReturns[i],
      vol20: roll20[i],
      vol60: roll60[i],
      vol252: roll252[i],
    }));

    return NextResponse.json({
      metrics: {
        annualizedVolatility: annVol,
        maxDrawdown: mdd,
        beta,
        historicalVaR95: histVaR95,
        parametricVaR95: paramVaR95,
        meanReturn: mu * 252, // Annualized
      },
      chartData,
      auditLog: [
        `Fetched ${assetData.length} records for ${ticker}`,
        `Forward filled ${benchClose.filter(v => v === null).length} missing benchmark records`,
        `Calculated metrics using ${logReturns ? 'log' : 'simple'} returns`,
      ],
      warnings: assetData.length < 252 ? ['Insufficient data window for 252-day rolling volatility'] : []
    });

  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
